class UMLClass {
  static $;
  constructor(jQuery, className, attributes, methods) {
    this.className = className;
    this.attributes = attributes || [];
    this.methods = methods || [];
    this.isSelected = false;
    this.editMode = false;

    $ = jQuery;

    this.createDOMElement(jQuery);
  }

  addAttribute(attribute) {
    this.attributes.push(attribute);
    this.refreshAttributesInDOM();
  }

  addMethod(method) {
    this.methods.push(method);
    this.refreshMethodsInDOM();
  }

  isEmpty() {
    return this.className.trim().length == 0 && this.attributes.length == 0 && this.methods.length == 0;
  }

  createDOMElement($) {
    console.log("createDOMElement", $)
    this.domElement = $('<div>', { 'class': "umlit-class" });

    this.nameContainer = $('<div>', { 'class': "umlit-class-name" });
    this.nameContainer.appendTo(this.domElement);



    this.attributesContainer = $('<ul>', { 'class': "umlit-class-attributes" });
    this.attributesContainer.appendTo(this.domElement);

    this.methodsContainer = $('<ul>', { 'class': "umlit-class-methods" });
    this.methodsContainer.appendTo(this.domElement);

    this.refreshDOMElement();
    this.refreshAttributesInDOM();
    this.refreshMethodsInDOM();


    this.editButton = this.addEditButton(this.attributesContainer, "Edit");
    this.editButton.on("click", () => this.editAttributes());

    this.editMethodsButton = this.addEditButton(this.methodsContainer, "Edit");
    this.editMethodsButton.on("click", () => this.editMethods());

    this.editNameButton = this.addEditButton(this.nameContainer, "Edit");
    this.editNameButton.on("click", () => this.editClassName());
  }

  addEditButton(container, text) {
    container = $(container.find(".umlit-options-container")) || container;
    var button = $('<button>', { "class": "umlit-options-button", "type": "button" });
    button.html(text);
    button.appendTo(container);

    return button;
  }

  appendOptionsContainer(container)
  {
    if(container.find(".umlit-options-container"))
      return $("<div>", { "class": "umlit-options-container" }).appendTo(container)
    else
    console.log("appendOptionsContainer()", "already exists in ", container)
  }

  editClassName() {
    this.emptyOptions(this.nameContainer);
    
    this.nameContainer. contents().filter(function() {
      return this.nodeType === 3 && $.trim(this.nodeValue) !== '';
    }).remove();

    var saveButton = this.addEditButton(this.nameContainer);
    saveButton.html("Save");
    var cancelButton = this.addEditButton(this.nameContainer);
    cancelButton.html("Cancel");

    let nameInput = $('<input>', { 'type': 'text', 'placeholder': "Attribute" }).appendTo(this.nameContainer);
    nameInput.val(this.className);

    saveButton.on("click", () => {
      
      this.className = nameInput.val();
      this.refreshNameInDOM();
      this.emptyOptions(this.nameContainer);

        
      this.editButton = this.addEditButton(this.nameContainer, "Edit");
      this.editButton.on("click", () => this.editClassName())

    })

    cancelButton.on("click", () => {
      this.refreshNameInDOM();
      this.emptyOptions(this.nameContainer);
  
      this.editButton = this.addEditButton(this.nameContainer, "Edit");
      this.editButton.on("click", () => this.editClassName())
    })
    
  }

  refreshNameInDOM() {
    console.log("refreshNameInDOM")
    
    console.log("xD",this.nameContainer.children("input").remove());
    this.appendOptionsContainer(this.nameContainer);
    this.nameContainer.append(this.className);

  }

  refreshDOMElement() {

    if (this.isSelected)
      this.domElement.addClass("umlit-class-highlight")
    else
      this.domElement.removeClass("umlit-class-highlight")

    this.refreshNameInDOM();
    this.refreshAttributesInDOM();
    this.refreshMethodsInDOM();
  }

  refreshAttributesInDOM() {
    console.log("refreshAttributesInDOM")

    this.appendOptionsContainer(this.attributesContainer)
    this.attributesContainer.find("li").remove();
    for (let i = 0; i < this.attributes.length; i++) {
      let attribute = this.attributes[i];
      $('<li>', { 'class': "umlit-class-attribute" }).html(attribute).appendTo(this.attributesContainer);
    }
  }

  emptyOptions(container) {
    container = $(container.find(".umlit-options-container")) || container;
    container.find("button").remove();
  }


  applyEditsAsArray(container, list, method) {
    let elements = container.find("li.editable");
    this[list] = [];
    for (let i = 0; i < elements.length; i++) {
      let el = $(elements[i]);
      let input = $(el.find("input"));
      this[list].push(input.val());
    }

    this.refreshAttributesInDOM();
    this.emptyOptions(container);
    this.editButton = this.addEditButton(container, "Edit");
    this.editButton.on("click", () => method());
  }


  editAttributes() {
    console.log("editAttributes", this)
    this.attributesContainer.find("li").remove();

    this.emptyOptions(this.attributesContainer);
    var saveButton = this.addEditButton(this.attributesContainer);
    saveButton.html("Save");
    var cancelButton = this.addEditButton(this.attributesContainer);
    cancelButton.html("Cancel");


    for (let i = 0; i < this.attributes.length; i++) {
      let attribute = this.attributes[i];
      this.addEditableListElement(this.attributesContainer, attribute, "Attribute");
    }

    this.addAdditionalInput(this.attributesContainer);

    cancelButton.on("click", () => {
      this.refreshAttributesInDOM();
      this.emptyOptions(this.attributesContainer);
      this.editButton = this.addEditButton(this.attributesContainer, "Edit");
      this.editButton.on("click", () => this.editAttributes())
    })

    saveButton.on("click", () => {
      this.applyEditsAsArray(this.attributesContainer, "attributes", () => this.editAttributes());
    })
  }

  addMoveButtons(liElement) {
    let attributeMoveUpButton = $('<button>').html("&uarr;");
    liElement.prepend(attributeMoveUpButton);
    attributeMoveUpButton.on("click", () => {
      console.log("attribute");
      var prevAttribute = liElement.prev('li');

      if (prevAttribute.length) {
        liElement.insertBefore(prevAttribute);
      }
    })

    let attributeMoveDownButton = $('<button>').html("&darr;");
    liElement.prepend(attributeMoveDownButton);
    attributeMoveDownButton.on("click", () => {
      console.log("attribute");
      var nextAttribute = liElement.next('li.editable');

      if (nextAttribute.length) {
        liElement.insertAfter(nextAttribute);
      }
    })
  }

  editMethods() {
    console.log("editMethods")
    this.methodsContainer.find("li").remove();

    this.emptyOptions(this.methodsContainer);
    var saveButton = this.addEditButton(this.methodsContainer);
    saveButton.html("Save");
    var cancelButton = this.addEditButton(this.methodsContainer);
    cancelButton.html("Cancel");

    for (let i = 0; i < this.methods.length; i++) {
      let method = this.methods[i];
      this.addEditableListElement(this.methodsContainer, method, "Method");
    }

    this.addAdditionalInput(this.methodsContainer, "Method");

    cancelButton.on("click", () => {
      this.refreshMethodsInDOM();
      this.emptyOptions(this.methodsContainer);
      this.editMethodsButton = this.addEditButton(this.methodsContainer, "Edit");
      this.editMethodsButton.on("click", () => this.editMethods())
    })

    saveButton.on("click", () => {

      this.applyEditsAsArray(this.methodsContainer, "methods", () => this.editMethods());
      this.refreshMethodsInDOM();
    })
  }

  addAdditionalInput(container, placeholder) {
    console.log("addAdditionalAttributeInput")
    let additionalLiElement = $('<li>', { 'class': "umlit-class-attribute" }).appendTo(container);
    let additionalInput = $('<input>', { 'type': 'text', 'placeholder': placeholder }).appendTo(additionalLiElement);

    let saveElementButton = $('<button>').html("Add");
    saveElementButton.appendTo(additionalLiElement);

    saveElementButton.on("click", (e) => {
      console.log("addAttribute-click")
      e.preventDefault();
      if (additionalInput.val().trim().length > 0) {
        let newEl = this.addEditableListElement(container, additionalInput.val(), placeholder);
        additionalLiElement.before(newEl);
        additionalInput.val("");
      }
    })
  }

  refreshMethodsInDOM() {
    console.log("refreshMethodsInDOM");

    this.appendOptionsContainer(this.methodsContainer);
    this.methodsContainer.find("li").remove();
    for (let i = 0; i < this.methods.length; i++) {
      let method = this.methods[i];
      $('<li>', { 'class': "umlit-class-method" }).html(method).appendTo(this.methodsContainer)
    }
  }


  addEditableListElement(container, value, placeholder) {
    let liElement = $("<li>", { "class": "editable" }).appendTo(container);
    let input = $('<input>', { 'type': 'text', 'placeholder': placeholder }).appendTo(liElement);
    if (value !== undefined)
      input.val(value);

    this.addMoveButtons(liElement);

    let deleteButton = $('<button>').html("X");
    deleteButton.appendTo(liElement);
    deleteButton.on("click", () => {
      liElement.remove();
    })

    return liElement;
  }
}

