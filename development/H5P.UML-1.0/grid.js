class Grid
{
    constructor(x,y, width,height, cols, rows)
    {
        this.x = x; 
        this.y = y;
        this.width = width;
        this.height = height;
        this.cols = cols;
        this.rows = rows;
    }

    placeInGrid(entity, col, row, mode)
    {
        entity.setPosition(this.colToX(col), this.rowToY(row));
    }

    colToX(col)
    {
        return this.x + (this.width/this.cols) * col;
    }
    rowToY(row)
    {
        return this.y + (this.height/this.rows) * row;
    }

    debugDraw()
    {
        if(DEBUG)
        {
            stroke(0);
            for(let currX = this.x; currX <= this.x + this.width; currX += this.width/this.cols )
            {
                line(currX, this.y, currX, this.y+this.height);
            }

            for(let currY = this.y; currY <= this.y + this.height; currY += this.height/this.rows )
            {
                line( this.x, currY,  this.x+this.width, currY);
            }
        }
    }
}