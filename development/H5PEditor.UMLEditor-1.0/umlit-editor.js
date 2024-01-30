H5PEditor.widgets.umlEditor = H5PEditor.UMLEditor = (function ($) {

  class UmlitEditor {
  /**
   * Creates color selector.
   *
   * @class H5PEditor.ColorSelector
   *
   * @param {Object} parent
   * @param {Object} field
   * @param {string} params
   * @param {H5PEditor.SetParameters} setValue
   */
  constructor(parent, field, params, setValue) {
    this.parent = parent;
    this.field = field;
    this.params = params;
    this.setValue = setValue;
    this.entities = [];

    var decoded = $("<div/>").html(this.params).text();

    let parsedEntities = JSON.parse(decoded);
    this.entities= parsedEntities.map(parsedEntity => new UMLClass($,parsedEntity.className,parsedEntity.attributes, parsedEntity.methods));
    

    UMLClass.removeCallback = (entity) => {
        console.log(entity);
        console.log(this.entities);
        let index = this.entities.indexOf(entity);
        if(index > -1)
        {
          console.log("Removing index",index);
          this.entities.splice(index,1);
          entity.domElement.remove();
        }
    }

    UMLClass.afterEditCallback = (entity) => {
     this.save();
    }
  }

  save () {
    this.params = this.entities.map(entity => { return  { attributes: entity.attributes, methods: entity.methods, className: entity.className}})
    console.log("saving", this.field,this.params,this.params);
    this.setValue(this.field, JSON.stringify(this.params));
  };

  getColor () {
    return this.params;
  };

  addClass() {
    let classToBeAdded = new UMLClass($,"",[], []);
    classToBeAdded.domElement.appendTo(this.display);

    this.entities.push(classToBeAdded);
  }

  /**
   * Append the field to the wrapper.
   *
   * @param {H5P.jQuery} $wrapper
   */
  appendTo($wrapper) {
    var self = this;

    self.$container = $('<div>', {
      'class': 'field text h5p-umlit-editor'
    });

    // Add header:
    $('<span>', {
      'class': 'h5peditor-label',
      html: self.field.label
    }).appendTo(self.$container);

    // Create input field
    self.$addClassButton = $('<button>', {
      'type': 'button',
      'class': 'umlit-button'
    }).html("Add Class").appendTo(self.$container);

    this.$addClassButton.on("click", () => {
      this.addClass();
    })

    // Add description:
    $('<span>', {
      'class': 'h5peditor-field-description',
      html: self.field.description
    }).appendTo(self.$container)

    this.display = $('<div>', { 'class': 'umlit-display' }).appendTo(this.$container);
    console.log("HO")
    self.$container.appendTo($wrapper);

    this.entities.forEach(element => {
      element.domElement.appendTo(this.display)
    });
  };

  onSelectedElement(element)
  {
    console.log(element)
  }
  
  /**
   * Validate the current values.
   *
   * @returns {boolean}
   */
  validate() {
    return true;
  };

  /**
   * Remove the current field
   */
  remove () { };
}

return UmlitEditor;
}) (H5P.jQuery);