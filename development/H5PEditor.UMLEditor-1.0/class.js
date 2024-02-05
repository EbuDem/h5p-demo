class UMLClass {
  static $;
  static removeCallback;
  static afterEditCallback;
  static toggleIsAnswerCallback;

  constructor(jQuery, className, attributes, methods) {
    this.className = className;
    this.attributes = attributes || [];
    this.methods = methods || [];
    this.isSelected = false;
    this.editMode = false;


    UMLClass.$ = jQuery;

    this.createDOMElement();
  }

  // Utility function to create DOM elements
  createElement(tag, options) {
    return UMLClass.$(`<${tag}>`, options);
  }

  // Utility function to add editable list element
  addEditableListElement(container, value, placeholder) {
    const liElement = this.createElement("li", { class: "editable" }).appendTo(container);
    const input = this.createElement("input", { type: "text", placeholder }).appendTo(liElement);

    if (value !== undefined) input.val(value);

    this.addMoveButtons(liElement);

    const deleteButton = this.createElement("button").html("X").appendTo(liElement);
    deleteButton.on("click", () => {
      liElement.remove();
    });

    return liElement;
  }

  // Utility function to add move buttons
  addMoveButtons(liElement) {
    const attributeMoveUpButton = this.createElement("button").html("&uarr;").prependTo(liElement);
    attributeMoveUpButton.on("click", () => this.moveElement(liElement, "prev"));

    const attributeMoveDownButton = this.createElement("button").html("&darr;").prependTo(liElement);
    attributeMoveDownButton.on("click", () => this.moveElement(liElement, "next"));
  }

  // Utility function to move an element in the list
  moveElement(element, direction) {
    const adjacentElement = element[direction]('li.editable');
    if (adjacentElement.length) {
      element[direction === "prev" ? "insertBefore" : "insertAfter"](adjacentElement);
    }
  }

  // Utility function to append options container
  appendOptionsContainer(container) {
    const optionsContainer = container.find(".umlit-options-container");
    if (!optionsContainer.length) {
      return this.createElement("div", { class: "umlit-options-container" }).appendTo(container);
    } else {
      return optionsContainer;
    }
  }

  // Utility function to add an edit button
  addEditButton(container, text, clickHandler, cssClass) {
    console.log(`add button ${text} to container`,container.get(0));
    const optionsContainer = this.appendOptionsContainer(container);
    const button = this.createElement("button", { class: "umlit-options-button", type: "button" }).html(text).appendTo(optionsContainer);
    if(cssClass)
      button.addClass(cssClass);
    if (clickHandler) {
      button.on("click", clickHandler);
    }

    return button;
  }

  // Main function to create DOM elements
  createDOMElement() {
    console.log("createDOMElement", UMLClass.$);

    this.domElement = this.createElement("div", { class: "umlit-class" });
    this.nameContainer = this.createElement("div", { class: "umlit-class-name" }).appendTo(this.domElement);
    this.attributesContainer = this.createElement("ul", { class: "umlit-class-attributes" }).appendTo(this.domElement);
    this.methodsContainer = this.createElement("ul", { class: "umlit-class-methods" }).appendTo(this.domElement);

    this.refreshDOMElement();

    this.editButton = this.addEditButton(this.attributesContainer, "", () => this.editAttributes(), "button-edit");
    this.editMethodsButton = this.addEditButton(this.methodsContainer, "", () => this.editMethods(), "button-edit");
    this.addEditButton(this.nameContainer, "", () => this.editClassName(), "button-edit");
    this.removeButton = this.addEditButton(this.nameContainer, "", () => {
      UMLClass.removeCallback(this);
    }, "button-remove");

    this.removeButton = this.addEditButton(this.nameContainer, "", () => {
      UMLClass.toggleIsAnswerCallback(this);
    }, "button-answer");
  }

  // Main function to edit class name
  editClassName() {
    this.emptyOptions(this.nameContainer);

    this.nameContainer.contents().filter(function () {
      return this.nodeType === 3 && UMLClass.$.trim(this.nodeValue) !== '';
    }).remove();

    const saveButton = this.addEditButton(this.nameContainer, "Save");
    const cancelButton = this.addEditButton(this.nameContainer, "Cancel");

    const nameInput = this.createElement("input", { type: "text", placeholder: "Attribute" }).appendTo(this.nameContainer).val(this.className);

    const saveHandler = () => {
      this.className = nameInput.val();
      this.refreshNameInDOM();
      this.emptyOptions(this.nameContainer);

      this.editButton = this.addEditButton(this.nameContainer, "Edit", () => this.editClassName());
      this.editButton = this.addEditButton(this.nameContainer, "", () => UMLClass.removeCallback(this), "button-remove");
      this.removeButton = this.addEditButton(this.nameContainer, "", () => {
        UMLClass.toggleIsAnswerCallback(this);
      }, "button-answer");
      UMLClass.afterEditCallback(this);
    };

    saveButton.on("click", saveHandler);
    cancelButton.on("click", () => {
      this.refreshNameInDOM();
      this.emptyOptions(this.nameContainer);
      this.editButton = this.addEditButton(this.nameContainer, "Edit", () => this.editClass());
    });
  }


  toggleSelected()
  {
    this.isSelected = !this.isSelected;
    if(this.isSelected)
      this.domElement.addClass("umlit-class-highlight")
    else 
      this.domElement.removeClass("umlit-class-highlight")
  }


  // Main function to refresh class name in DOM
  refreshNameInDOM() {
    console.log("refreshNameInDOM");

    this.nameContainer.children("input").remove();
    this.appendOptionsContainer(this.nameContainer);
    this.nameContainer.append(this.className);
  }

  // Main function to refresh entire DOM element
  refreshDOMElement() {
    if (this.isSelected) this.domElement.addClass("umlit-class-highlight");
    else this.domElement.removeClass("umlit-class-highlight");

    this.refreshNameInDOM();
    this.refreshAttributesInDOM();
    this.refreshMethodsInDOM();
  }

  // Main function to refresh attributes in DOM
  refreshAttributesInDOM() {
    console.log("refreshAttributesInDOM");

    this.appendOptionsContainer(this.attributesContainer);
    this.attributesContainer.find("li").remove();

    for (let i = 0; i < this.attributes.length; i++) {
      const attribute = this.attributes[i];
      this.createElement("li", { class: "umlit-class-attribute" }).html(attribute).appendTo(this.attributesContainer);
    }
  }

  // Utility function to empty options in a container
  emptyOptions(container) {
    container = container.find(".umlit-options-container") || container;
    container.find("button").remove();
  }

  // Utility function to apply edits as an array
  applyEditsAsArray(container, list, method) {
    const elements = container.find("li.editable");
    this[list] = [];

    for (let i = 0; i < elements.length; i++) {
      const el = UMLClass.$(elements[i]);
      const input = UMLClass.$(el.find("input"));
      this[list].push(input.val());
    }

    this.refreshAttributesInDOM();
    this.emptyOptions(container);
    this.editButton = this.addEditButton(container, "Edit", () => method());
    UMLClass.afterEditCallback(this);
  }

  // Main function to edit attributes
  editAttributes() {
    console.log("editAttributes", this);
    this.attributesContainer.find("li").remove();

    this.emptyOptions(this.attributesContainer);
    const saveButton = this.addEditButton(this.attributesContainer, "Save");
    const cancelButton = this.addEditButton(this.attributesContainer, "Cancel");

    for (let i = 0; i < this.attributes.length; i++) {
      const attribute = this.attributes[i];
      this.addEditableListElement(this.attributesContainer, attribute, "Attribute");
    }

    this.addAdditionalInput(this.attributesContainer);

    cancelButton.on("click", () => {
      this.refreshAttributesInDOM();
      this.emptyOptions(this.attributesContainer);
      this.editButton = this.addEditButton(this.attributesContainer, "Edit", () => this.editAttributes());
    });

    saveButton.on("click", () => {
      this.applyEditsAsArray(this.attributesContainer, "attributes", () => this.editAttributes());
    });
  }

  // Main function to edit methods
  editMethods() {
    console.log("editMethods");
    this.methodsContainer.find("li").remove();

    this.emptyOptions(this.methodsContainer);
    const saveButton = this.addEditButton(this.methodsContainer, "Save");
    const cancelButton = this.addEditButton(this.methodsContainer, "Cancel");

    for (let i = 0; i < this.methods.length; i++) {
      const method = this.methods[i];
      this.addEditableListElement(this.methodsContainer, method, "Method");
    }

    this.addAdditionalInput(this.methodsContainer, "Method");

    cancelButton.on("click", () => {
      this.refreshMethodsInDOM();
      this.emptyOptions(this.methodsContainer);
      this.editMethodsButton = this.addEditButton(this.methodsContainer, "Edit", () => this.editMethods());
    });

    saveButton.on("click", () => {
      this.applyEditsAsArray(this.methodsContainer, "methods", () => this.editMethods());
      this.refreshMethodsInDOM();
    });
  }

  // Main function to refresh methods in DOM
  refreshMethodsInDOM() {
    console.log("refreshMethodsInDOM");

    this.appendOptionsContainer(this.methodsContainer);
    this.methodsContainer.find("li").remove();

    for (let i = 0; i < this.methods.length; i++) {
      const method = this.methods[i];
      this.createElement("li", { class: "umlit-class-method" }).html(method).appendTo(this.methodsContainer);
    }
  }

  // Main function to add an additional input
  addAdditionalInput(container, placeholder) {
    console.log("addAdditionalAttributeInput");

    const additionalLiElement = this.createElement("li", { class: "umlit-class-attribute" }).appendTo(container);
    const additionalInput = this.createElement("input", { type: "text", placeholder }).appendTo(additionalLiElement);

    const saveElementButton = this.createElement("button").html("Add").appendTo(additionalLiElement);

    saveElementButton.on("click", (e) => {
      console.log("addAttribute-click");
      e.preventDefault();

      if (additionalInput.val().trim().length > 0) {
        const newEl = this.addEditableListElement(container, additionalInput.val(), placeholder);
        additionalLiElement.before(newEl);
        additionalInput.val("");
      }
    });
  }
}
