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
      this.answers = [];

      var decoded = $("<div/>").html(this.params).text();
      let parsedExercise = { entities: [], prompt: "", answers: [] };
      try {
        parsedExercise = JSON.parse(decoded);
      }
      catch (exception) {
        console.error("Error while parsing exercise: ", exception);
      }
      this.entities = parsedExercise.entities.map(parsedEntity => new EditableUMLClass($, parsedEntity.className, parsedEntity.attributes, parsedEntity.methods));
      this.answers = parsedExercise.answers;

      this.setCallbacks();

    
    }

    setCallbacks()
    {
      console.log(this.display);
      EditableUMLClass.removeCallback = (entity) => {
        if (!confirm("Are you sure you want to remove this element?"))
          return;

        let index = this.entities.indexOf(entity);
        if (index > -1) {
          console.log("Removing index", index);
          this.entities.splice(index, 1);
          entity.domElement.remove();
        }
        this.save();
      }

      EditableUMLClass.afterEditCallback = () => {
        this.display.html();
        this.entities.forEach(element => {
          element.domElement.appendTo(this.display)
        });

        this.save();
      }

      EditableUMLClass.toggleIsAnswerCallback = (entity) => {
        entity.toggleSelected();
        this.save();
      }

      EditableUMLClass.moveCallback = (entity, direction) => {
        const index = this.entities.indexOf(entity);

        if (index !== -1) {
          const newIndex = index + direction;

          if (newIndex >= 0 && newIndex < this.entities.length) {
            this.entities.splice(index, 1);
            this.entities.splice(newIndex, 0, entity);
          }
        }

        this.display.html();
        this.entities.forEach(element => {
          element.domElement.appendTo(this.display)
        });

        this.save();
      }
    }

    save() {
      this.params = {
        entities: this.entities.map(entity => {
          return { attributes: entity.attributes, methods: entity.methods, className: entity.className };
        }),
        answers: this.entities.map((entity, index) => {
          if (entity.isSelected)
            return index
          else undefined;
        }).filter((el) => el !== undefined) // Filter entities where isSelected is true
      };

      this.setValue(this.field, JSON.stringify(this.params));
    };

    getColor() {
      return this.params;
    };

    addClass() {
      let classToBeAdded = new EditableUMLClass($, "", [], []);
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
      }).html(UmlitEditor.t("addClass")).appendTo(self.$container);

      this.$addClassButton.on("click", () => {
        this.addClass();
      })

      // Add description:
      $('<span>', {
        'class': 'h5peditor-field-description',
        html: self.field.description
      }).appendTo(self.$container)

      this.display = $('<div>', { 'class': 'umlit-display' }).appendTo(this.$container);
      self.$container.appendTo($wrapper);

      this.entities.forEach(element => {
        element.domElement.appendTo(this.display)
      });

      for (let i = 0; i < this.answers.length; i++) {
        let index = this.answers[i];
        this.entities[index].toggleSelected();
      }
    };
    /**
     * Validate the current values.
     *
     * @returns {boolean}
     */
    validate() {
      return this.entities
        .some((entity) => entity.isSelected);
    };

    static t = (key, params) => {
      return H5PEditor.t('H5PEditor.UMLEditor', key, params);
    };
  }

  return UmlitEditor;
})(H5P.jQuery);