class UMLClass {
        
    constructor(className, attributes, methods, ) {
        this.className = className;
        this.attributes = attributes || [];
        this.methods = methods || [];
        this.highlight = false;
        this.createDOMElement();
      }
  
    addAttribute(attribute) {
      this.attributes.push(attribute);
      this.refreshAttributesInDOM();
    }
  
    addMethod(method) {
      this.methods.push(method);
      this.refreshMethodsInDOM();
    }

    refreshDOMElement()
    {
      if(this.highlight)
        this.domElement.addClass("umlit-class-highlight")
      else 
      this.domElement.removeClass("umlit-class-highlight")

        this.domElement.find("umlit-class-name").html(this.className);
        this.refreshAttributesInDOM();
        this.refreshMethodsInDOM();
    }

    createDOMElement()
    {
        this.domElement =  $('<div>', { 'class': "umlit-class" });
        
        var nameContainer = $('<div>', { 'class': "umlit-class-name" });
        nameContainer.html(this.className)
        nameContainer.appendTo(this.domElement);

        var attributesContainer = $('<ul>', { 'class': "umlit-class-attributes" });
        attributesContainer.appendTo(this.domElement);

        var methodsContainer = $('<ul>', { 'class': "umlit-class-methods" });
        methodsContainer.appendTo(this.domElement);

        this.refreshAttributesInDOM();
        this.refreshMethodsInDOM();
    }
  
    refreshAttributesInDOM()
    {
        let attributesContainer = this.domElement.find(".umlit-class-attributes");
        attributesContainer.html("");
        for(let i = 0; i < this.attributes.length; i++)
        {
          let attribute = this.attributes[i];
          $('<li>', { 'class': "umlit-class-attribute" }).html(attribute).appendTo(attributesContainer)
        }
    }

    refreshMethodsInDOM()
    {
        let methodsContainer = this.domElement.find(".umlit-class-methods")
        methodsContainer.html("");
        // TODO: Change this when methods are in exercise json
        for(let i = 0; i < this.methods.length; i++)
        {
          let attribute = this.methods[i];
          $('<li>', { 'class': "umlit-class-method" }).html(attribute).appendTo(methodsContainer)
        }
    }
  }


  
