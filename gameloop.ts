
const VIEW_INC = 2 * Math.PI / 180.0;
const WALL_COLOR = [
    "#000000",
    "#66cc33",
    "#0066cc",
    "#ff9933"
]

const SCR_W = 1024;
const SCR_H = 768;
const SCR_H_HALF = SCR_H / 2;
const SCR_W_HALF = SCR_W / 2;

const HUD_X = SCR_W - (SCR_W / 4);
const HUD_Y = SCR_H - (SCR_H / 4);

class GameLoop {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private inputs: Inputs = new Inputs();
    private raycaster: RayCaster;

    private x = 800;
    private y = 700;
    private view = 5.0;

    constructor() {
        // main canvas (screen)
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.raycaster = new RayCaster(leveldata, this.ctx);
    }

     public mainLoop() {
        requestAnimationFrame(() => this.mainLoop());

        // check inputs
        this.checkInputs();

        // logic
        this.logic();

        // render
        this.render();
    }

    private checkInputs() {
        if(this.inputs.isDown(Inputs.ARROW_UP)) {
            this.forward();
        }

        if(this.inputs.isDown(Inputs.ARROW_DOWN)) {
            this.backward();
        }

        if(this.inputs.isDown(Inputs.ARROW_RIGHT)) {
            this.view += VIEW_INC;
            if(this.view > Math.PI * 2) {
                this.view = (Math.PI * 2) - this.view;
            }
        }

        if(this.inputs.isDown(Inputs.ARROW_LEFT)) {
            this.view -= VIEW_INC;
            if(this.view < 0) {
                this.view += (Math.PI * 2);
            }
        }
    }


    private logic() {
    }

    private render() {
        this.ctx.save();

        this.ctx.globalAlpha = 1.0;

        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, SCR_W, SCR_H);

        // draw sky
        // var grdSky = this.ctx.createLinearGradient(0,0,0, SCR_H_HALF);
        // grdSky.addColorStop(0, "#004080");
        // grdSky.addColorStop(1, "#cce5ff");

        // // draw floor
        // var grdFloor = this.ctx.createLinearGradient(0, SCR_H_HALF, 0, SCR_H);
        // grdFloor.addColorStop(1, "#bf8040");
        // grdFloor.addColorStop(0, "#261a0d");


        // this.ctx.fillStyle = grdSky;
        // this.ctx.fillRect(0, 0, SCR_W, SCR_H_HALF);

        // this.ctx.fillStyle = grdFloor;
        // this.ctx.fillRect(0, SCR_H_HALF, SCR_W, SCR_H);

        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "white";

        // raycast!
        this.raycaster.render(this.x, this.y, this.view);


        // draw minimap
        this.drawLevel();

        this.ctx.restore();
    }

    private forward() {
        var newX = this.x + (Math.cos(this.view) * 2);
        var newY = this.y + (Math.sin(this.view) * 2);

        if(this.raycaster.getDataAt(newX, newY) == 0) {
            this.x = newX;
            this.y = newY;
        }
    }

    private backward() {
        var newX = this.x - (Math.cos(this.view) * 2);
        var newY = this.y - (Math.sin(this.view) * 2);

        if(this.raycaster.getDataAt(newX, newY) == 0) {
            this.x = newX;
            this.y = newY;
        }
    }

    private drawLevel() {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(HUD_X, HUD_Y, HUD_X + (SCR_W / 4), HUD_Y + (SCR_H / 4));
        var j: number;
        var i: number;
        for(j=0; j < SCR_H; j+=32) {
            for(i=0; i<SCR_W; i+=32) {
                var wall = this.raycaster.getDataAt(i,j);

                if(wall != 0) {
                    this.ctx.fillStyle = WALL_COLOR[wall];
                    this.ctx.fillRect(HUD_X + (i/4), HUD_Y + (j/4), 8, 8);
                }
            }
        }

        // draw player
        this.ctx.beginPath();
        this.ctx.arc(HUD_X + (this.x / 4), HUD_Y + (this.y / 4), 3, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = "yellow";
        this.ctx.fill();

        // draw player direction
        this.ctx.beginPath();
        this.ctx.strokeStyle = "yellow";
        this.ctx.lineWidth = 2;
        this.ctx.moveTo(HUD_X + (this.x / 4), HUD_Y + (this.y / 4));
        this.ctx.lineTo(HUD_X + (this.x / 4) + (8 * Math.cos(this.view)), HUD_Y + (this.y / 4) + (8 * Math.sin(this.view)))
        this.ctx.stroke();

    }

}


window.onload = () => {
    let game = new GameLoop();

    game.mainLoop();
}