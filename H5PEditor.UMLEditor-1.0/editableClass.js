var H5P = H5P || {};
var UMLClass = H5P.UMLClass;


H5P.EditableUMLClass = (function ($) {
  class EditableUMLClass extends UMLClass {
  static $;

  constructor( className, attributes, methods) {
    super(className, attributes, methods);
    this.editMode = false;
    this.nameContainer = null;
    this.attributesContainer = null;
    this.methodsContainer = null;
    this.createDOMElement();
  }

  createDOMElement() {
    this.domElement = this.createElement("div", { class: "umlit-class", draggable: "true" });

    this.nameContainer = this.setupContainer("Name");
    this.attributesContainer = this.setupContainer("Attributes");
    this.methodsContainer = this.setupContainer("Methods");
    this.refreshDOMElement();

 
  }

  removeDOMElement() {
    this.domElement.remove();
    this.nameContainer = null;
    this.attributesContainer = null;
    this.methodsContainer = null;
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

  addAdditionalInput(container, placeholder) {
    const additionalLiElement = this.createElement("li", { class: "umlit-class-attribute editable" }).appendTo(container);
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

  addDeleteButton(liElement) {
    this.createElement("button", { title: H5PEditor.UMLEditor.t("delete"), class: "" }).html("✕").on("click", () => liElement.remove()).appendTo(liElement);
  }

  moveElement(element, direction) {
    // Prevent moving down if element is the second last in the list
    if (direction === "next" && element.nextAll('li.editable').length === 1) {
      return; // Do nothing, as the element is the second last and shouldn't move down
    }
  
    const adjacentElement = element[direction]('li.editable');
    if (adjacentElement.length) {
      element[direction === "prev" ? "insertBefore" : "insertAfter"](adjacentElement);
    }
  }

  editClassName() {
    this.nameContainer.html("");
    this.createElement("input", { class: "h5peditor-text", type: "text", placeholder: H5PEditor.UMLEditor.t("name") }).appendTo(this.nameContainer).val(this.className);
  }

  editAttributes() {
    this.attributesContainer.html("");
    this.attributesContainer.isBeingEdited = true;

    for (let i = 0; i < this.attributes.length; i++) {
      const attribute = this.attributes[i];
      this.addEditableListElement(this.attributesContainer, attribute, H5PEditor.UMLEditor.t("attribute"));
    }
    this.addAdditionalInput(this.attributesContainer, H5PEditor.UMLEditor.t("attribute"));
  }

  editMethods() {
    this.methodsContainer.html("");
    this.methodsContainer.isBeingEdited = true;

    for (let i = 0; i < this.methods.length; i++) {
      const method = this.methods[i];
      this.addEditableListElement(this.methodsContainer, method, H5PEditor.UMLEditor.t("method"));
    }
    this.addAdditionalInput(this.methodsContainer, H5PEditor.UMLEditor.t("method"));
  }

  makeItEditable() {
    this.isBeingEdited = true;
    this.editClassName();
    this.editAttributes();
    this.editMethods();
  }

  createFromEditable() {
    let newName = this.nameContainer.find('input').val() || " ";
    let newAttributes = [];
    let newMethods = [];

    this.attributesContainer.find('li.editable > input').not(':last').each(function (index, element) {
      element = $(element);
      newAttributes.push(element.val());
    });

    this.methodsContainer.find('li.editable > input').not(':last').each(function (index, element) {
      element = $(element);
      newMethods.push(element.val());
    });

    return new EditableUMLClass(newName,newAttributes,newMethods);
  }
}

  return EditableUMLClass
})(H5P.jQuery);

var EditableUMLClass = H5P.EditableUMLClass;