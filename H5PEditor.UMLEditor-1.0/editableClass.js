  var H5P = H5P || {};
  var UMLClass = H5P.UMLClass;

  class EditableUMLClass extends UMLClass {
    static $;
    static removeCallback;
    static afterEditCallback;
    static toggleIsAnswerCallback;
    static moveCallback;

    constructor(jQuery, className, attributes, methods) {
      EditableUMLClass.$ = jQuery;

      super(jQuery, className, attributes, methods);
      this.editMode = false;
      this.nameContainer = null;
      this.attributesContainer = null;
      this.methodsContainer = null;

      this.createDOMElement();
    }

    createDOMElement() {
      this.domElement = this.createElement("div", { class: "umlit-class" });

      this.nameContainer = this.setupContainer("Name", () => this.editClassName(), () => EditableUMLClass.afterEditCallback());
      this.attributesContainer = this.setupContainer("Attributes", () => this.editAttributes(), () => EditableUMLClass.afterEditCallback());
      this.methodsContainer = this.setupContainer("Methods", () => this.editMethods(), () => EditableUMLClass.afterEditCallback());

      this.refreshDOMElement();

      let optionContainer = this.createElement("div", { class: "umlit-class-options" });
      this.createElement("button", { class: `umlit-options-button button-answer`, type: "button", title:  H5PEditor.UMLEditor.t("markAsAnswer") }).on("click", () => {
        EditableUMLClass.toggleIsAnswerCallback(this);
      }).appendTo(optionContainer);
      this.createElement("button", { class: `umlit-options-button button-move-left`, type: "button", title:  H5PEditor.UMLEditor.t("moveLeft")}).on("click", () => {
        EditableUMLClass.moveCallback(this, -1);
      }).appendTo(optionContainer);

      this.createElement("button", { class: `umlit-options-button button-move-right`, type: "button", title:  H5PEditor.UMLEditor.t("moveRight")}).on("click", () => {
        EditableUMLClass.moveCallback(this, 1);
      }).appendTo(optionContainer);

      this.createElement("button", { class: `umlit-options-button button-remove`, type: "button", title: H5PEditor.UMLEditor.t("deleteClass") }).on("click", () => {
        EditableUMLClass.removeCallback(this);
      }).appendTo(optionContainer);

      optionContainer.appendTo(this.domElement);
    }

    removeDOMElement() {
      this.domElement.remove();
      this.nameContainer = null;
      this.attributesContainer = null;
      this.methodsContainer = null;
    }

    setupContainer(label, editFunction, afterEditCallback) {
      console.log("setupContainer",editFunction,afterEditCallback);
      let container = super.setupContainer(label);

      container.isBeingEdited = false;
      container.editBtn = this.addButton(container, "button-edit", () => editFunction());
      container.saveBtn = this.addButton(container, "button-save", () => afterEditCallback());
      container.cancelBtn = this.addButton(container, "button-cancel", () => this.refreshContainerButtons(container));

      container.editBtn.prop('title', H5PEditor.UMLEditor.t("edit"));
      container.cancelBtn.prop('title', H5PEditor.UMLEditor.t("discard"));
      container.saveBtn.prop('title', H5PEditor.UMLEditor.t("save"));

      return container;
    }

    addEditableListElement(container, value, placeholder) {
      const liElement = this.createElement("li", { class: "editable" }).appendTo(container);
      const input = this.createElement("input", { type: "text", placeholder }).appendTo(liElement);

      if (value !== undefined) input.val(value);

      this.addMoveButtons(liElement);
      this.addDeleteButton(liElement);

      return liElement;
    }

    addMoveButtons(liElement) {
      const moveButtonsContainer = this.createElement("div", { class: "move-buttons-container" }).prependTo(liElement);

      const attributeMoveDownButton = this.createElement("button", { class: "move-button move-button-down", title: H5PEditor.UMLEditor.t("moveDown") }).html("&#9660;").prependTo(moveButtonsContainer);
      attributeMoveDownButton.on("click", () => this.moveElement(liElement, "next"));

      const attributeMoveUpButton = this.createElement("button", { class: "move-button move-button-up", title: H5PEditor.UMLEditor.t("moveUp") }).html("&#9650;").prependTo(moveButtonsContainer);
      attributeMoveUpButton.on("click", () => this.moveElement(liElement, "prev"));
    }

    addDeleteButton(liElement) {
      this.createElement("button", { title: H5PEditor.UMLEditor.t("delete") }).html("X").on("click", () => liElement.remove()).appendTo(liElement);
    }

    moveElement(element, direction) {
      const adjacentElement = element[direction]('li.editable');
      if (adjacentElement.length) {
        element[direction === "prev" ? "insertBefore" : "insertAfter"](adjacentElement);
      }
    }

    getOrCreateOptionsContainer(container) {
      if (container === undefined)
        return null;

      const optionsContainer = container.find(".umlit-options-container");
      return optionsContainer.length ? optionsContainer : this.createElement("div", { class: "umlit-options-container" }).appendTo(container);
    }

    addButton(container, className, clickHandler) {
      const optionsContainer = this.getOrCreateOptionsContainer(container);
      const button = this.createElement("button", { class: `umlit-options-button ${className}`, type: "button" }).on("click", clickHandler);
      optionsContainer.append(button);
      return button;
    }

    editClassName() {
      console.log(this.nameContainer);

      this.nameContainer.contents().filter(function () {
        return this.nodeType === 3 && EditableUMLClass.$.trim(this.nodeValue) !== '';
      }).remove();

      this.nameContainer.isBeingEdited = true;
      this.refreshContainerButtons(this.nameContainer);

      this.nameContainer.saveBtn.on("click", () => {
        this.className = nameInput.val();
        this.nameContainer.isBeingEdited = false;
        this.removeDOMElement();
        this.createDOMElement();
        EditableUMLClass.afterEditCallback(this);
      });

      this.nameContainer.cancelBtn.on("click", () => {
        this.nameContainer.isBeingEdited = false;
        this.removeDOMElement();
        this.createDOMElement();
        EditableUMLClass.afterEditCallback(this);
        this.refreshContainerButtons(this.nameContainer);
      });

      const nameInput = this.createElement("input", { type: "text", placeholder: H5PEditor.UMLEditor.t("name") }).appendTo(this.nameContainer).val(this.className);
    }

    editAttributes() {
      console.log(this.attributesContainer);
      this.attributesContainer.find("li").remove();
      this.attributesContainer.isBeingEdited = true;
      this.refreshContainerButtons(this.attributesContainer);

      for (let i = 0; i < this.attributes.length; i++) {
        const attribute = this.attributes[i];
        this.addEditableListElement(this.attributesContainer, attribute, H5PEditor.UMLEditor.t("attribute"));
      }

      this.addAdditionalInput(this.attributesContainer, H5PEditor.UMLEditor.t("attribute"));

      this.attributesContainer.saveBtn.on("click", () => {
        this.attributesContainer.isBeingEdited = false;
        this.applyEditsAsArray(this.attributesContainer, "attributes");
        this.removeDOMElement();
        this.createDOMElement();
        EditableUMLClass.afterEditCallback(this);
        this.refreshContainerButtons(this.attributesContainer);
      });

      this.attributesContainer.cancelBtn.on("click", () => {
        this.attributesContainer.isBeingEdited = false;
        this.removeDOMElement();
        this.createDOMElement();
        EditableUMLClass.afterEditCallback(this);
        this.refreshContainerButtons(this.attributesContainer);
      });
    }

    editMethods() {
      this.methodsContainer.find("li").remove();
      this.methodsContainer.isBeingEdited = true;
      this.refreshContainerButtons(this.methodsContainer);

      for (let i = 0; i < this.methods.length; i++) {
        const method = this.methods[i];
        this.addEditableListElement(this.methodsContainer, method,  H5PEditor.UMLEditor.t("method"));
      }

      this.addAdditionalInput(this.methodsContainer, H5PEditor.UMLEditor.t("method"));

      this.methodsContainer.saveBtn.on("click", () => {
        this.methodsContainer.isBeingEdited = false;
        this.applyEditsAsArray(this.methodsContainer, "methods");
        this.removeDOMElement();
        this.createDOMElement();
        EditableUMLClass.afterEditCallback(this);
        this.refreshContainerButtons(this.methodsContainer);
      });

      this.methodsContainer.cancelBtn.on("click", () => {
        this.methodsContainer.isBeingEdited = false;
        this.removeDOMElement();
        this.createDOMElement();
        EditableUMLClass.afterEditCallback(this);
        this.refreshContainerButtons(this.methodsContainer);
      });
    }

    applyEditsAsArray(container, list) {
      console.log("applyEditAsArray");

      const elements = container.find("li.editable");
      this[list] = [];

      for (let i = 0; i < elements.length; i++) {
        const el = EditableUMLClass.$(elements[i]);
        const input = EditableUMLClass.$(el.find("input"));
        if (input.val().length > 0)
          this[list].push(input.val());
      }

      this.removeDOMElement();
      this.createDOMElement();
      EditableUMLClass.afterEditCallback(this);
    }

    refreshContainerButtons() {
      var listContainer = [this.nameContainer, this.attributesContainer, this.methodsContainer];
      listContainer = listContainer.filter(con => con !== undefined && con !== null);
      var anyEdited = listContainer.some(con => con.isBeingEdited);

      for (let container of listContainer) {
        var optionsContainer = this.getOrCreateOptionsContainer(container);

        if (container.isBeingEdited) {
          EditableUMLClass.$(container.editBtn).hide();
          EditableUMLClass.$(container.saveBtn).show();
          EditableUMLClass.$(container.cancelBtn).show();
        } else if (anyEdited && optionsContainer !== undefined) {
          optionsContainer.hide();
        } else if (!anyEdited && optionsContainer !== undefined) {
          optionsContainer.show();
          EditableUMLClass.$(container.editBtn).show();
          EditableUMLClass.$(container.saveBtn).hide();
          EditableUMLClass.$(container.cancelBtn).hide();
        }

      }
    }

    toggleSelected()
    {
      super.toggleSelected();
      EditableUMLClass.afterEditCallback(this);
    }

    addAdditionalInput(container, placeholder) {
      const additionalLiElement = this.createElement("li", { class: "umlit-class-attribute" }).appendTo(container);
      const additionalInput = this.createElement("input", { type: "text", placeholder }).appendTo(additionalLiElement);

      const saveElementButton = this.createElement("button", { title: "Add Element" }).html(H5PEditor.UMLEditor.t("add")).appendTo(additionalLiElement);

      saveElementButton.on("click", (e) => {
        e.preventDefault();

        if (additionalInput.val().trim().length > 0) {
          const newEl = this.addEditableListElement(container, additionalInput.val(), placeholder);
          additionalLiElement.before(newEl);
          additionalInput.val("");
        }
      });
    }

    refreshNameInDOM() {
      super.refreshNameInDOM();
      this.getOrCreateOptionsContainer(this.nameContainer);
      this.refreshContainerButtons(this.nameContainer);
    }

    refreshItemsInDOM(container, items, itemClass) {
      super.refreshItemsInDOM(container, items, itemClass);
      this.getOrCreateOptionsContainer(container);
      this.refreshContainerButtons(container);
    }
  }
