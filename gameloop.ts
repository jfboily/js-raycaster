
const VIEW_INC = 2 * Math.PI / 180.0;
const WALL_COLOR = [
    "#000000",
    "#66cc33",
    "#0066cc",
    "#ff9933"
]

class GameLoop {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private inputs: Inputs = new Inputs();
    private raycaster: RayCaster;

    private x = 315;
    private y = 235;
    private view = 0.0;

    constructor() {
        // main canvas (screen)
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.raycaster = new RayCaster(leveldata, this.ctx);
        console.log(this.raycaster);
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

        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, 640, 480);

        this.drawLevel();

        // raycast!
        this.raycaster.render(this.x, this.y, this.view);


        // draw player
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = "#ff00ff";
        this.ctx.fill()

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
        var j: number;
        var i: number;
        for(j=0; j < 480; j+=32) {
            for(i=0; i<640; i+=32) {
                var wall = this.raycaster.getDataAt(i,j);

                if(wall != 0) {
                    this.ctx.fillStyle = WALL_COLOR[wall];
                    this.ctx.fillRect(i, j, 32, 32);
                }
            }
        }
    }

}


window.onload = () => {
    let game = new GameLoop();

    game.mainLoop();
}