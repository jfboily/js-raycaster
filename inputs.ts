class Inputs {

    private keyState = new Array<Boolean>();
    public static ARROW_UP = 38;
    public static ARROW_DOWN = 40;
    public static ARROW_LEFT = 37;
    public static ARROW_RIGHT = 39;


    constructor() {
        document.addEventListener('keydown', (event: KeyboardEvent) => this.keyDown(event));
        document.addEventListener('keyup', (event: KeyboardEvent) => this.keyUp(event));
    }

    private keyDown(event: KeyboardEvent) {
        console.log("KEY : ", event.keyCode)
        this.keyState[event.keyCode] = true;
        event.preventDefault();
    }

    private keyUp(event: KeyboardEvent) {
        this.keyState[event.keyCode] = false;
        event.preventDefault();
    }

    public isDown(keyCode: number) {
        return this.keyState[keyCode];
    }

    public isUp(keyCode: number) {
        return !this.keyState[keyCode];
    }
}