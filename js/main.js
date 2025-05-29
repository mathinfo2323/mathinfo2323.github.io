const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width=720;
canvas.height=1280;

let touch_x=0;
let touch_y=0;
let touch_valid=false;

document.addEventListener("dblclick",function(e){e.preventDefault();},{passive: false});
window.addEventListener( "DOMContentLoaded" , ()=> {

            const cvs = document.getElementById("gameCanvas");
            cvs.addEventListener("click",e=>{
                const rect = e.target.getBoundingClientRect();

                    // ブラウザ上での座標を求める
                const   viewX = e.clientX - rect.left,
                        viewY = e.clientY - rect.top;

                    // 表示サイズとキャンバスの実サイズの比率を求める
                const   scaleWidth =  cvs.clientWidth / cvs.width,
                        scaleHeight =  cvs.clientHeight / cvs.height;

                    // ブラウザ上でのクリック座標をキャンバス上に変換
                const   canvasX = Math.floor( viewX / scaleWidth ),
                        canvasY = Math.floor( viewY / scaleHeight );

                touch_x=canvasX;
                touch_y=canvasY;
                touch_valid=true;
            });
        });




let loop;

const keys = [];
// 入力されたキーを記録する
document.addEventListener("keydown", function (e) {
    keys[e.key] = true;
});

// キーが離された時に離されたことを記録する
document.addEventListener("keyup", function (e) {
    keys[e.key] = false;
});

key_allocate=[['a','A'],['s','S'],['k','K'],['l','L']];

class virtual_gamepad{
    constructor(length) {
    // コンストラクタ: インスタンスを作成する際に実行されるメソッド
    // インスタンス固有の初期化処理を行う
        this.line_length=length;
        this.LineInput=new Array(length);
        this.PastInput=new Array(length);
        for(loop=0;loop<length;loop++){
            this.LineInput[loop]=false;
            this.PastInput[loop]=false;
        }
    }
    refresh(notes_length) {
    // メソッド1の定義
        for(loop=0;loop<this.LineInput.length;loop++){
            this.PastInput[loop]=this.LineInput[loop];
            this.LineInput[loop]=keys[key_allocate[loop][0]] || keys[key_allocate[loop][1]];
        }
        if(touch_valid){
            console.log("called");
            touch_valid=false;
            for(loop=0;loop<this.LineInput.length;loop++){
                this.LineInput[loop]=touch_rect(touch_x,touch_y,canvas.width/this.line_length*loop,canvas.height/notes_length*(notes_length-1),canvas.width/this.line_length,canvas.height/notes_length);
                console.log(canvas.width/this.line_length*loop);
                console.log(canvas.height/notes_length*(notes_length-1));
                console.log(canvas.width/this.line_length);
                console.log(canvas.height/notes_length);
                console.log(this.LineInput[loop]);
            }
        }
    }
    get_info(number,now_flag) {
    // メソッド2の定義
        if(now_flag){
            return this.LineInput[number];
        }
        else{
            return this.PastInput[number];
        }
    }
}

function drawline(x1,y1,x2,y2,color){
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
}
function drawrect(x,y,w,h,color){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
function array_slide(arr,left_direction){
    if(left_direction){
        for(loop=0;loop<arr.length-1;loop++){
            arr[loop]=arr[loop+1];
        }
    }
    else{
        for(loop=arr.length-1;loop>0;loop--){
            arr[loop]=arr[loop-1];
        }
    }
}
function touch_rect(tx,ty,x,y,w,h){
    if(tx>=x & tx<=x+w & ty>=y & ty <=y+h){
        return true;
    }
    else{
        return false;
    }
}

let scene_name={
    title:0,
    regular_mode:1
}
let now_scene=scene_name.title;

let game_phase={
    playing:0,
    gameover:1
}
let notes_judge={
    no_touch:0,
    wrong:1,
    correct:2
}

class base_scene{
    constructor(){
        this.delta_time=0.0;
        this.past_time=0.0;
        this.frame_count=0;
        this.counter1=0;
    }
    basic_refresh(){
        let now_time=performance.now();
        this.delta_time=now_time-this.past_time;
        this.past_time=now_time;
        this.frame_count+=1;
    }
}
class scene_prototype extends base_scene{//コピペして使う
    constructor(){
        super();
    }
    draw(){
    }
    process(){
    }
    change_process(next_scene){
        switch(nextscene){
            case scene_name.title:
                break;
        }
    }
}
class title_scene extends base_scene{
    constructor(){
        super();
        this.pad=new virtual_gamepad(4);
        this.x=0;
    }
    draw(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(this.x, 100, 100, 100);
    }
    process(){
        this.pad.refresh(8);
        if(this.pad.get_info(0,true)){
            this.x-=10;
        }
        if(this.pad.get_info(3,true)){
            this.x+=10;
        }
    }
    change_process(next_scene){
        switch(nextscene){
            case scene_name.regular_mode:
                break;
        }
    }
}
class regular_mode_scene extends base_scene{//コピペして使う
    constructor(){
        super();
        this.gamepad=new virtual_gamepad(4);
        this.gamepad_regular=new virtual_gamepad(4);
        this.notes=new Array(8);
        this.notes=[0,3,3,1,2,1,0,2];
        for(loop=0;loop<this.notes.length;loop++){
            this.notes[loop]=getRandomInt(40)%4;
        }
        this.now_phase=game_phase.playing;
    }
    draw(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle='black';
        for(loop=1;loop<this.gamepad_regular.line_length;loop++){
            drawline(canvas.width/this.gamepad_regular.line_length*loop,0,canvas.width/this.gamepad_regular.line_length*loop,canvas.height,'black');
        }
        for(loop=1;loop<this.notes.length;loop++){
            drawline(0,canvas.height/this.notes.length*loop,canvas.width,canvas.height/this.notes.length*loop,'black');
        }
        for(loop=0;loop<this.notes.length;loop++){
            drawrect(canvas.width/this.gamepad_regular.line_length*this.notes[loop],canvas.height/this.notes.length*loop,canvas.width/this.gamepad_regular.line_length,canvas.height/this.notes.length);
        }
        
        if(this.now_phase==game_phase.gameover){
            ctx.font = "64px serif";
            ctx.fillStyle = 'red';
            ctx.fillText("GAME OVER", 100, 200);
        }
        ctx.font = "48px serif";
        ctx.fillStyle = 'red';
        ctx.fillText(`(${touch_x},${touch_y})`, 100, 1000);
        //ctx.font = "48px serif";
        //ctx.fillText(`${this.delta_time}`, 10, 50);
    }
    process(){
        this.basic_refresh(this.gamepad_regular.line_length);
        this.gamepad.refresh(this.gamepad.line_length);
        this.counter1+=1;
        switch(this.now_phase){
            case game_phase.playing:
                var judge=notes_judge.no_touch;
                for(loop=0;loop<4;loop++){
                    if(judge!=notes_judge.wrong){
                        if(this.gamepad.get_info(loop,true)& !this.gamepad.get_info(loop,false)){
                            if(loop==this.notes[this.notes.length-1]){
                                judge=notes_judge.correct;
                            }
                            else{
                                judge=notes_judge.wrong;
                            }
                        }
                    }
                }
                if(judge==notes_judge.wrong){
                    this.now_phase=game_phase.gameover;
                }
                else if(judge==notes_judge.correct){
                    array_slide(this.notes,false);
                    this.notes[0]=getRandomInt(40)%4;
                }

                break;
            case game_phase.gameover:
                break;
        }
        if(this.counter1>10 && 0){
            this.counter1=0;
            array_slide(this.notes,false);
            this.notes[0]=getRandomInt(40)%4;
            
        }
    }
    change_process(next_scene){
        switch(nextscene){
            case scene_name.title:
                break;
        }
    }
}

function change_scene(next_scene){
    scene.change_process(next_scene);
    switch(now_scene){
        case scene_name.title:
            delete scene;
            scene=new title_scene();
            break;
        case scene_name.regular_mode:
            break;
    }
}

function game_loop(){
    scene.draw();
    scene.process();
    switch(now_scene){
        
        case scene_name.title:
            break;
        case scene_name.regular_mode:
            break;
    }
    requestAnimationFrame(game_loop);
}

scene=new regular_mode_scene();
game_loop();
