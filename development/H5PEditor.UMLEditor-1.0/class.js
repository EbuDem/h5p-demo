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

  // Utility function to add an edit button
  addEditButton(container, clickHandler) {
    console.log(`add button to container`, container.get(0));
    const optionsContainer = this.getOrCreateOptionsContainer(container);
    const button = this.createElement("button", { class: "umlit-options-button button-edit", type: "button" }).appendTo(optionsContainer);

    if (clickHandler) {
      button.on("click", clickHandler);
    }
    return button;
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
  getOrCreateOptionsContainer(container) {
    const optionsContainer = container.find(".umlit-options-container");
    if (!optionsContainer.length) {
      return this.createElement("div", { class: "umlit-options-container" }).appendTo(container);
    } else {
      return optionsContainer;
    }
  }

  // Main function to create DOM elements
  createDOMElement() {
    console.log("createDOMElement", UMLClass.$);

    this.domElement = this.createElement("div", { class: "umlit-class" });
    this.nameContainer = this.createElement("div", { class: "umlit-class-name" }).appendTo(this.domElement);
    this.attributesContainer = this.createElement("ul", { class: "umlit-class-attributes" }).appendTo(this.domElement);
    this.methodsContainer = this.createElement("ul", { class: "umlit-class-methods" }).appendTo(this.domElement);

    this.nameContainer.isBeingEdited = false;
    this.attributesContainer.isBeingEdited = false;
    this.methodsContainer.isBeingEdited = false;


    this.attributesContainer.editBtn = this.addEditButton(this.attributesContainer, () => this.editAttributes());
    this.attributesContainer.saveBtn = this.addSaveButton(this.attributesContainer);
    this.attributesContainer.cancelBtn = this.addCancelButton(this.attributesContainer);

    this.methodsContainer.editBtn = this.addEditButton(this.methodsContainer, () => this.editMethods());
    this.methodsContainer.saveBtn = this.addSaveButton(this.methodsContainer);
    this.methodsContainer.cancelBtn = this.addCancelButton(this.methodsContainer);

    this.nameContainer.editBtn = this.addEditButton(this.nameContainer, () => this.editClassName());
    this.nameContainer.removeBtn = this.addRemoveButton(this.nameContainer, () => {
      UMLClass.removeCallback(this);
    });
    this.nameContainer.answerBtn = this.addIsAnswerButton(this.nameContainer, () => {
      UMLClass.toggleIsAnswerCallback(this);
    });
    this.nameContainer.saveBtn = this.addSaveButton(this.nameContainer);
    this.nameContainer.cancelBtn = this.addCancelButton(this.nameContainer);

    
    this.refreshDOMElement();
  }

  // Main function to edit class name
  editClassName() {
    this.nameContainer.contents().filter(function () {
      return this.nodeType === 3 && UMLClass.$.trim(this.nodeValue) !== '';
    }).remove();

    const saveHandler = () => {
      this.className = nameInput.val();
      this.refreshNameInDOM();

      this.nameContainer.isBeingEdited = false;
      this.refreshContainerButtons(this.nameContainer);


      UMLClass.afterEditCallback(this);
    };

    this.nameContainer.isBeingEdited = true;
    this.refreshContainerButtons(this.nameContainer);

    this.nameContainer.saveBtn.on("click", saveHandler);
    this.nameContainer.cancelBtn.on("click", () => {
      this.refreshNameInDOM();
      this.nameContainer.isBeingEdited = false;
      this.refreshContainerButtons(this.nameContainer);

    });

    const nameInput = this.createElement("input", { type: "text", placeholder: "Attribute" }).appendTo(this.nameContainer).val(this.className);
  }


  toggleSelected() {
    this.isSelected = !this.isSelected;
    if (this.isSelected)
      this.domElement.addClass("umlit-class-highlight")
    else
      this.domElement.removeClass("umlit-class-highlight")
  }

  addCancelButton(container, clickHandler) {
    console.log(`add cancel button  to container`, container.get(0));
    const optionsContainer = this.getOrCreateOptionsContainer(container);
    const button = this.createElement("button", { class: "umlit-options-button button-cancel", type: "button" }).appendTo(optionsContainer);
    if (clickHandler) {
      button.on("click", clickHandler);
    }

    return button;
  }

  addSaveButton(container, clickHandler) {
    console.log(`add save button  to container`, container.get(0));
    const optionsContainer = this.getOrCreateOptionsContainer(container);
    const button = this.createElement("button", { class: "umlit-options-button button-save", type: "button" }).appendTo(optionsContainer);
    if (clickHandler) {
      button.on("click", clickHandler);
    }

    return button;
  }

  addRemoveButton(container, clickHandler) {
    console.log(`add save button  to container`, container.get(0));
    const optionsContainer = this.getOrCreateOptionsContainer(container);
    const button = this.createElement("button", { class: "umlit-options-button button-remove", type: "button" }).appendTo(optionsContainer);
    if (clickHandler) {
      button.on("click", clickHandler);
    }

    return button;
  }

  addIsAnswerButton(container, clickHandler) {
    console.log(`add answer button  to container`, container.get(0));
    const optionsContainer = this.getOrCreateOptionsContainer(container);
    const button = this.createElement("button", { class: "umlit-options-button button-answer", type: "button" }).appendTo(optionsContainer);
    if (clickHandler) {
      button.on("click", clickHandler);
    }

    return button;
  }

  // Main function to refresh class name in DOM
  refreshNameInDOM() {
    console.log("refreshNameInDOM");
    this.nameContainer.children("input").remove();
    this.getOrCreateOptionsContainer(this.nameContainer);
    this.nameContainer.append(this.className);

    this.refreshContainerButtons(this.nameContainer);
  }

  // Main function to refresh entire DOM element
  refreshDOMElement() {
    if (this.isSelected) this.domElement.addClass("umlit-class-highlight");
    else this.domElement.removeClass("umlit-class-highlight");

    this.refreshNameInDOM();
    this.refreshAttributesInDOM();
    this.refreshMethodsInDOM();
  }


  // Utility function to apply edits as an array
  applyEditsAsArray(container, list) {

    const elements = container.find("li.editable");
    this[list] = [];

    for (let i = 0; i < elements.length; i++) {
      const el = UMLClass.$(elements[i]);
      const input = UMLClass.$(el.find("input"));
      this[list].push(input.val());
      console.log("DEBUG", input.val());
    }

    this.refreshAttributesInDOM();
    this.refreshMethodsInDOM();
    UMLClass.afterEditCallback(this);
  }

  // Main function to edit attributes
  editAttributes() {
    console.log("editAttributes", this);
    this.attributesContainer.find("li").remove();
    this.attributesContainer.isBeingEdited = true;
    this.refreshContainerButtons(this.attributesContainer);
    
    this.attributesContainer.saveBtn.on("click", () => {
      this.attributesContainer.isBeingEdited = false;
      this.applyEditsAsArray(this.attributesContainer, "attributes");
      this.refreshContainerButtons(this.attributesContainer);
    });

    this.attributesContainer.cancelBtn.on("click", () => {
      this.attributesContainer.isBeingEdited = false;
      this.refreshAttributesInDOM();
      this.refreshContainerButtons(this.attributesContainer);
    });

    for (let i = 0; i < this.attributes.length; i++) {
      const attribute = this.attributes[i];
      this.addEditableListElement(this.attributesContainer, attribute, "Attribute");
    }

    this.addAdditionalInput(this.attributesContainer);
  }

  // Main function to edit methods
  editMethods() {
    console.log("editMethods");
    this.methodsContainer.find("li").remove();
    this.methodsContainer.isBeingEdited = true;
    this.refreshContainerButtons(this.methodsContainer);

    for (let i = 0; i < this.methods.length; i++) {
      const method = this.methods[i];
      this.addEditableListElement(this.methodsContainer, method, "Method");
    }

    this.addAdditionalInput(this.methodsContainer, "Method");

    this.methodsContainer.cancelBtn.on("click", () => {
      this.refreshMethodsInDOM();
      this.emptyOptions(this.methodsContainer);
      this.methodsContainer.isBeingEdited = false;
    });

    this.methodsContainer.saveBtn.on("click", () => {
      this.methodsContainer.isBeingEdited = false;
      this.applyEditsAsArray(this.methodsContainer, "methods");
      this.refreshContainerButtons(this.methodsContainer);
    });
  }

  refreshItemsInDOM(container, items, itemClass) {
    console.log(`refresh${itemClass}InDOM`);
  
    this.getOrCreateOptionsContainer(container);
    container.find("li").remove();
    this.refreshContainerButtons(container);
  
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      this.createElement("li", { class: `umlit-class-${itemClass}` }).html(item).appendTo(container);
    }
  }

  refreshContainerButtons(container)
  {
    if(container.isBeingEdited)
    {
      console.log("show save and cancel");
      UMLClass.$(container.editBtn).hide();
      UMLClass.$(container.saveBtn).show();
      UMLClass.$(container.cancelBtn).show();

    }
    else 
    {
      console.log("show edit button")
      UMLClass.$(container.editBtn).show();
      UMLClass.$(container.saveBtn).hide();
      UMLClass.$(container.cancelBtn).hide();
    }
  }
  
  refreshAttributesInDOM() {
    this.refreshItemsInDOM(this.attributesContainer, this.attributes, "Attribute");
  }
  
  refreshMethodsInDOM() {
    this.refreshItemsInDOM(this.methodsContainer, this.methods, "Method");
  }

  // Main function to add an additional input
  addAdditionalInput(container, placeholder) {
    console.log("addAdditionalInput");

    const additionalLiElement = this.createElement("li", { class: "umlit-class-attribute" }).appendTo(container);
    const additionalInput = this.createElement("input", { type: "text", placeholder }).appendTo(additionalLiElement);

    const saveElementButton = this.createElement("button").html("Add").appendTo(additionalLiElement);

    saveElementButton.on("click", (e) => {
      console.log("addItem-click");
      e.preventDefault();

      if (additionalInput.val().trim().length > 0) {
        const newEl = this.addEditableListElement(container, additionalInput.val(), placeholder);
        additionalLiElement.before(newEl);
        additionalInput.val("");
      }
    });
  }
}
