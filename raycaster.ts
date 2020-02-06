const ANGLE30 = 30 *  Math.PI / 180;
const ANGLE60 = 60 * Math.PI / 180;
const ANGLE_STEP = ANGLE60 / SCR_W;

// const WALL_COLOR = [
//     "#000000",
//     "#66cc33",
//     "#0066cc",
//     "#ff9933"
// ]

const WALL_HEIGHT = SCR_H * 25;
const LEVEL_W = SCR_W / 32;
const LEVEL_H = SCR_H / 32;

const WALL_COLORS = [
    {
        r: 0x0,
        g: 0x0,
        b: 0x0
    },
    {
        r: 0x66,
        g: 0xcc,
        b: 0x33
    },
    {
        r: 0x0,
        g: 0x66,
        b: 0xcc
    },
    {
        r: 0xff,
        g: 0x99,
        b: 0x33,
    },

]


class Intersection {
    material: number;
    textureDx: number;
    distance: number;
    horiz: boolean;
}

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

        if(dataX > LEVEL_W - 1 || dataX < 0 || dataY > LEVEL_H - 1 || dataY < 0) {
            //console.log("BUG! " + dataX + ", " + dataY);
            return 99;
        }

        try {
            return this.data[dataY][dataX];
        } catch (e) {
            console.log(e, dataX, dataY);
            return 0;
        }

    }

    public castRay(x, y, angle): Intersection {
        var ax = Math.cos(angle);
        var ay = Math.sin(angle);

        var intersecVX = Number.MAX_VALUE;
        var intersecVY = Number.MAX_VALUE;
        var intersecHX = Number.MAX_VALUE;
        var intersecHY = Number.MAX_VALUE;

        var intersec = new Intersection();

        var textureH: number;
        var textureV: number;


        // coordinates inside grid square
        var sx = x % 32;//x - (Math.floor(x / 32) * 32);
        var sy = y % 32;//y - (Math.floor(y / 32) * 32);

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

                while(x + px > 0 && x + px < SCR_W && y + py > 0 && y + py < SCR_H && this.getDataAt(x + px, y + py) == 0) {
                    px += 32;
                    py = px * m;
                }

                textureV = this.getDataAt(x + px, y + py)
                intersec.textureDx = (y + py) % 32;
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

                while(x + px > 0 && x + px < SCR_W && y + py > 0 && y + py < SCR_H && this.getDataAt(x + px - 1, y + py) == 0) {
                    px -= 32;
                    py = px * m;
                }

                textureV = this.getDataAt(x + px - 1, y + py);
                intersec.textureDx = (y + py) % 32;
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

                while(x + px > 0 && x + px < SCR_W && y + py > 0 && y + py < SCR_H && this.getDataAt(x + px, y + py) == 0) {
                    py += 32;
                    px = py * m;
                }

                textureH = this.getDataAt(x + px, y + py);
                intersec.textureDx = (x + px) % 32;
                intersecHX = x + px;
                intersecHY = y + py;
            } else {
                var py = -sy;
                var px = py * m;

                while(x + px > 0 && x + px < SCR_W && y + py > 0 && y + py < SCR_H && this.getDataAt(x + px, y + py - 1) == 0) {
                    py -= 32;
                    px = py * m;
                }

                textureH = this.getDataAt(x + px, y + py - 1);
                intersec.textureDx = (x + px) % 32;
                intersecHX = x + px;
                intersecHY = y + py;
            }
        }

        var distV = ((x - intersecVX) * (x - intersecVX)) + ((y - intersecVY) * (y - intersecVY));
        var distH = ((x - intersecHX) * (x - intersecHX)) + ((y - intersecHY) * (y - intersecHY));

        if(distV < distH) {
            // return value
            intersec.horiz = false;
            intersec.distance = Math.sqrt(distV);
            intersec.material = textureV;
        } else {
            // return value
            intersec.material = textureH;
            intersec.horiz = true;
            intersec.distance = Math.sqrt(distH);
        }

        return intersec;
    }

    public render(x, y, angle) {
        var startAngle = angle - ANGLE30;
        var endAngle = angle + ANGLE30;
        var correctionAngle = -ANGLE30;

        var a: number;
        var lineX = 0;

        for(a = startAngle; a < endAngle; a += ANGLE_STEP) {
            var intersec = this.castRay(x, y, a);
            var height = WALL_HEIGHT / ((intersec.distance + 1) * Math.cos(correctionAngle));
            var distShade = ((height*height) / (SCR_H*SCR_H)) > 1 ? 1.0 : (height / SCR_H);
            var colorShaded: string;
            var colorRaw = WALL_COLORS[intersec.material];
            //var colorAlt = WALL_COLOR[intersec.material];

            if(intersec.horiz) {
                colorShaded = this.makeShadedColor(colorRaw, 0.9 * distShade * 1.5);
            } else {
                colorShaded = this.makeShadedColor(colorRaw, 1.0 * distShade * 1.5);
            }

            this.drawVline(lineX, height, colorShaded);
            lineX++;
            correctionAngle += ANGLE_STEP;
        }
    }

    private drawVline(x: number, height: number, texture: string) {
        var startY = SCR_H_HALF - (height / 2);
        var endY = SCR_H_HALF + (height / 2);

        this.ctx.beginPath();
        this.ctx.strokeStyle = texture;//WALL_COLOR[texture];
        this.ctx.moveTo(x, startY);
        this.ctx.lineTo(x, endY);
        this.ctx.stroke();
    }

    private makeShadedColor(c: any, factor: number): string {
        var newc = "#"+this.makeHex(c.r * factor) + this.makeHex(c.g * factor) + this.makeHex(c.b * factor);
        return newc;
    }

    private makeHex(x: number) {
        x = Math.floor(x);
        if(x < 0) {
            x = 0
        } else if(x > 255) {
            x = 255;
        }

        var res = x.toString(16);

        if(res.length < 2) {
            res = "0"+res;
        }

        return res;
    }
}