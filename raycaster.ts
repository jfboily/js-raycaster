const ANGLE30 = 30 *  Math.PI / 180;
const ANGLE60 = 60 * Math.PI / 180;
const ANGLE_STEP = ANGLE60 / 640;

class RayCaster {

    private data: number[][];
    private ctx: CanvasRenderingContext2D;

    constructor(data: number[][], ctx: CanvasRenderingContext2D) {
        this.data = data;
        this.ctx = ctx;
    }

    public getLevelData() {
        return this.data;
    }

    public getDataAt(x: number, y: number) {
        var dataX = Math.floor(x/32);
        var dataY = Math.floor(y/32);

        if(dataX > 19 || dataX < 0 || dataY > 14 || dataY < 0) {
            console.log("BUG!");
            return 1;
        }

        return this.data[dataY][dataX];
    }

    public castRay(x, y, angle): number {
        var ax = Math.cos(angle);
        var ay = Math.sin(angle);

        var intersecVX = Number.MAX_VALUE;
        var intersecVY = Number.MAX_VALUE;
        var intersecHX = Number.MAX_VALUE;
        var intersecHY = Number.MAX_VALUE;

        // coordinates inside grid square
        var sx = x - (Math.floor(x / 32) * 32);
        var sy = y - (Math.floor(y / 32) * 32);

        // intersection with vertical lines
        // ax must NOT be 0
        if(ax != 0) {

            var m = ay / ax;
            // ray to the right
            if(ax > 0) {
//                (px,py)
//                  .
//                 /|
//                / |
//               /  |
//      (sx,sy) *---+
//

                var px = (32 - sx);
                var py = (px * m);

                while(x + px < 640 && x + px > 0 && y + py < 480 && y + py > 0 && this.getDataAt(x + px, y + py) == 0) {
                    px += 32;
                    py = px * m;
                }

                intersecVX = x + px;
                intersecVY = y + py;
            } else {
//
//          (px,py)
//             .
//             |\
//             | \
//             |  \
//             +---* (sx,sy)
//
                var px = -sx;
                var py = px * m;

                while(x + px < 640 && x + px > 0 && y + py > 0 && y + py < 480 && this.getDataAt(x + px - 1, y + py) == 0) {
                    px -= 32;
                    py = px * m;
                }

                intersecVX = x + px;
                intersecVY = y + py;
            }
        }

        // intersection with horizontal lines
        if(ay != 0) {
            var m = ax / ay;

            if(ay > 0) {
                var py = 32 - sy;
                var px = py * m;

                while(x + px < 640 && x + px > 0 && y + py < 480 && y + py > 0 && this.getDataAt(x + px, y + py) == 0) {
                    py += 32;
                    px = py * m;
                }

                intersecHX = x + px;
                intersecHY = y + py;
            } else {
                var py = -sy;
                var px = py * m;

                while(x + px < 640 && x + px > 0 && y + py < 480 && y + py > 0 && this.getDataAt(x + px, y + py - 1) == 0) {
                    py -= 32;
                    px = py * m;
                }

                intersecHX = x + px;
                intersecHY = y + py;
            }
        }

        var distV = ((x - intersecVX) * (x - intersecVX)) + ((y - intersecVY) * (y - intersecVY));
        var distH = ((x - intersecHX) * (x - intersecHX)) + ((y - intersecHY) * (y - intersecHY));

        var intersecX: number;
        var intersecY: number;

        if(distV < distH) {
            intersecX = intersecVX;
            intersecY = intersecVY;
        } else {
            intersecX = intersecHX;
            intersecY = intersecHY;
        }


        this.ctx.beginPath();
        this.ctx.moveTo(x,y);
        this.ctx.lineTo(intersecX, intersecY);
        this.ctx.strokeStyle = "#ffffff";
        this.ctx.stroke();


        return 0;
    }

    public render(x, y, angle) {
        var startAngle = angle - ANGLE30;
        var endAngle = angle + ANGLE30;

        var a: number

        for(a = startAngle; a < endAngle; a += ANGLE_STEP) {
            this.castRay(x, y, a);
        }
    }
}