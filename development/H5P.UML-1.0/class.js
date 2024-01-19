class UMLClass {
    static nameLineHeight = 20;
    static paddingX = 5;
    static paddingY = 15;
    static attrLineHeight = 15;

    
    constructor(className, attributes, methods, startX, startY) {
        this.className = className;
        this.attributes = attributes || [];
        this.methods = methods || [];
        this.draggable = false;
        this.x = startX; 
        this.y = startY;
        this.width = 200;
        this.height =  15  + 20 * this.attributes.length;;
      }
  
    addAttribute(attribute) {
      this.attributes.push(attribute);
    }
  
    addMethod(method) {
      this.methods.push(method);
    }

    setPosition(x,y)
    {
        this.x = x || this.x;
        this.y = y || this.y;
    }
  
    draw() {
   
        stroke(0);
       
        fill(255);
      
        rect(this.x, this.y, this.width, this.height);
        line(this.x, this.y + UMLClass.nameLineHeight, this.x + this.width, this.y + UMLClass.nameLineHeight);
      
        fill(0);
        noStroke();
        textStyle(BOLD);
        text(this.className, this.x + UMLClass.paddingX, this.y + UMLClass.paddingY);
      
        let attrStartY = this.y + UMLClass.nameLineHeight + UMLClass.paddingY;
      
        // List Attributes
        textStyle(NORMAL);
        for (let i = 0; i < this.attributes.length; i++) {
          let attribute = this.attributes[i];
          text(attribute, this.x + UMLClass.paddingX, attrStartY + UMLClass.attrLineHeight * i);
        }
    }
  }


  
