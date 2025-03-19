H5P.UMLClass = (function ($) {
  class UMLClass {
    constructor( className, attributes, methods) {
      this.className = className;
      this.attributes = attributes || [];
      this.methods = methods || [];
      this.isSelected = false;
      this.isAnswer = false;
 
      this.createDOMElement();
    }

    toggleIsSelected() {
      this.isSelected = !this.isSelected;
      this.refreshDOMElement();
    }
    
    toggleIsAnswer() {
      this.isAnswer = !this.isAnswer;
      this.refreshDOMElement();
    }

    setIsAnswer(val)
    {
      this.isAnswer = val;
      this.refreshDOMElement();
    }

    setIsSelected(val)
    {
      this.isSelected = val;
      this.refreshDOMElement();
    }

    refreshDOMElement() {
      if (this.isSelected)
        this.domElement.addClass("umlit-class-selected")
      else
        this.domElement.removeClass("umlit-class-selected")

      if (this.isAnswer)
        this.domElement.addClass("umlit-class-highlight")
      else
        this.domElement.removeClass("umlit-class-highlight")


      this.refreshNameInDOM();
      this.refreshAttributesInDOM();
      this.refreshMethodsInDOM();
    }

    refreshNameInDOM() {
      this.nameContainer.html(this.className)
    }

    refreshItemsInDOM(container, items, itemClass) {
      container.find("li").remove();

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        this.createElement("li", { class: `umlit-class-${itemClass}` }).html(item).appendTo(container);
      }
    }

    createDOMElement() {
      this.domElement = this.createElement("div", { class: "umlit-class" });

      this.nameContainer = this.setupContainer("Name");
      this.attributesContainer = this.setupContainer("Attributes");
      this.methodsContainer = this.setupContainer("Methods");

      this.refreshDOMElement();
    }

    setupContainer(label) {
      let container = this.createElement("div", { class: `umlit-class-${label.toLowerCase()}` }).appendTo(this.domElement);
      return container;
    }

    refreshAttributesInDOM() {
      this.refreshItemsInDOM(this.attributesContainer, this.attributes, "Attribute");
    }

    refreshMethodsInDOM() {
      this.refreshItemsInDOM(this.methodsContainer, this.methods, "Method");
    }

    createElement(tag, options) {
      return $(`<${tag}>`, options);
    }
  }

  return UMLClass
})(H5P.jQuery);


