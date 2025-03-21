H5PEditor.widgets.umlEditor = H5PEditor.UMLEditor = (function ($) {

  class UmlitEditor {
    /**
     * Creates UML Editor
     * @class H5PEditor.UmlitEditor
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
      this.display = $('<div>', { 'id': 'umlit-display' });

      let parsedExercise;
      try {
        parsedExercise = JSON.parse(this.htmlDecode(this.params)) || { entities: [], prompt: "", answers: [] };
      }
      catch (exception) {
        console.error("Error while parsing exercise: ", exception);
      }

      parsedExercise.entities.forEach(element => {
        this.addClass(element.className, element.attributes, element.methods)
      });
      this.answers = parsedExercise.answers;

      const self = this;
      this.display.on("click",".umlit-class", function() {
        const $clickedElement = $(this);
        const matchedObject = self.entities.find(obj => obj.domElement.is($clickedElement));

        if(!matchedObject.isBeingEdited)
        {
          matchedObject.toggleIsSelected()
          self.refreshUMLClasses();
        }
      });
    }

    refreshUMLClasses() {
      this.display.html("");
      this.entities.forEach(element => {
        if (element.domElement != null)
        element.refreshDOMElement();
        this.display.append(element.domElement);
      });

      self.$editbtn.prop('disabled', this.entities.filter(o => o.isSelected).length != 1);
      self.$deletebtn.prop('disabled', !this.entities.some(o => o.isSelected));
      self.$markbtn.prop("disabled",  !this.entities.some(o => o.isSelected));
      self.$unmarkbtn.prop("disabled",  !this.entities.some(o => o.isSelected));
    }

    removeEntity = (entity) => {
      if (!confirm("Are you sure you want to remove this element?"))
        return;

      let index = this.entities.indexOf(entity);
      if (index > -1) {
        this.entities.splice(index, 1);
        entity.removeDOMElement();
      }
      this.save();
    }


    initDragAndDrop() {
      const gridItemSelector = ".umlit-class";
      const parent = this.display;
      let draggedItem = null;
      let draggingOver = null;
      let lastDraggingOverIndex = -1;
      let lastDraggedItemIndex = -1;

      parent.on("dragstart", gridItemSelector, function (e) {
        draggedItem = this;
        $(this).css("opacity", "0.5");
      });

      const self = this;
      // Handle the drag over event
      parent.on("dragover", gridItemSelector, function (e) {
        e.preventDefault(); // Necessary to allow dropping
        draggingOver = this;
        if (draggingOver !== draggedItem) {
          const items = parent.children(gridItemSelector);
          const draggedIndex = items.index(draggedItem);
          const overIndex = items.index(draggingOver);

          // Swap positions of the dragged item and the one it is hovering over
          if (draggedIndex < overIndex) {
            $(draggingOver).after(draggedItem);
          } else {
            $(draggingOver).before(draggedItem);
          }

          lastDraggedItemIndex = draggedIndex;
          lastDraggingOverIndex = overIndex;
        }
      });

      // Handle the drag end event
      parent.on("dragend", gridItemSelector, function () {
        $(this).css("opacity", "1");

        let overEntity = self.entities[lastDraggingOverIndex];
        self.entities[lastDraggingOverIndex] = self.entities[lastDraggedItemIndex];
        self.entities[lastDraggedItemIndex] = overEntity;
        console.log(lastDraggedItemIndex, lastDraggingOverIndex);
        self.refreshUMLClasses();

        draggedItem = null;
        draggingOver = null;

        self.save();
      });
    }

    initEditClassPopup($container) {
      self.$popup = $('<div>', {
        'class': 'umlit-editor-popup'
      });

      self.$popup.appendTo($container);

      self.$popup.hide();

      var titleContainer = $('<div>', { 'class': 'umlit-editor-popup-title'});
      self.$popupTitle = $('<h3>', { 'class': ''});
      titleContainer.append(self.$popupTitle);
      self.$popup.append(titleContainer);


      var popupButtons = $('<div>', {
        class: 'umlit-editor-popup-buttons',
        style: '' // add any inline styles if needed
      })

      var saveBtn = $('<button>', { text: UmlitEditor.t("save") });
      var cancelBtn = $('<button>', { text:  UmlitEditor.t("cancel")  });
      popupButtons.append(
        saveBtn,
        cancelBtn
      );

      cancelBtn.on("click", () => {
        this.hideEditClassPopup();
      });

      saveBtn.on("click", () => {
        let entity = self.$popup.$object;
        if (entity.before) {
          const index = this.entities.findIndex(e => e === entity.before);
          if (index !== -1) {
            let oldEntity = this.entities[index];
            let newEntity = this.entities[index] = entity.createFromEditable();
            newEntity.before = undefined;
            newEntity.isBeingEdited = false;
            newEntity.refreshDOMElement();
            oldEntity.domElement.replaceWith(this.entities[index].domElement);
          }
        }
        else {

          let newEntity = entity.createFromEditable();
          this.entities.push(newEntity);
          newEntity.domElement.appendTo(this.display);
        }

        this.hideEditClassPopup();
        this.save();
      });

      self.$popup.append(popupButtons);
    }

    showEditClassPopup(entity) {
      self.$popup.show();
      if (entity) {
        self.$popupTitle.html(UmlitEditor.t('editClass'));   
        let classToBeUpdated = new EditableUMLClass(entity.className, entity.attributes, entity.methods);
        classToBeUpdated.domElement.appendTo(self.$popup);
        classToBeUpdated.before = entity;
        classToBeUpdated.makeItEditable();
        self.$popup.$object = classToBeUpdated;
      }
      else {
        self.$popupTitle.html( UmlitEditor.t('addClass'));   
        let classToBeCreated = new EditableUMLClass();
        classToBeCreated.domElement.appendTo(self.$popup);
        classToBeCreated.makeItEditable();
        self.$popup.$object = classToBeCreated;
      }

    }

    hideEditClassPopup() {
      self.$popup.hide();
      self.$popup.$object = undefined;
      self.$popup.find('.umlit-class').remove();
    }

    clearSelection() {
      this.entities.forEach(entity => {
        entity.setIsSelected(false);
      })
    }

    addClass(name, attributes, methods) {
      name = name || "";
      attributes = attributes || [];
      methods = methods || [];
      let classToBeAdded = new EditableUMLClass(name, attributes, methods);
      classToBeAdded.domElement.appendTo(this.display);

      this.entities.push(classToBeAdded);
    }

    appendTo($wrapper) {
      var self = this;

      self.$container = $('<div>', {
        'class': 'field text h5p-umlit-editor'
      });

      $('<span>', {
        'class': 'h5peditor-label',
        html: self.field.label
      }).appendTo(self.$container);

    
      this.menu = $('<div>', { 'class': "h5p-umlit-editor-menu"});

      this.menu.appendTo(this.$container);
      this.display.appendTo(this.$container);
      self.$container.appendTo($wrapper);

      for (let i = 0; i < this.answers.length; i++) {
        let index = this.answers[i];
        this.entities[index].toggleIsAnswer();
      }

      self.appendButtons();
      self.initDragAndDrop();
      self.initEditClassPopup(self.$container);
    };

    appendButtons() {
      self.$addbtn = this.addButton(UmlitEditor.t("addClass"), () => this.showEditClassPopup());
      self.$editbtn = this.addButton(UmlitEditor.t("editClass"), () => {
        this.entities.forEach((val) => {
          if (val.isSelected) this.showEditClassPopup(val);
        });
      });

      self.$deletebtn = this.addButton(UmlitEditor.t("deleteClass"), () => {
        this.entities.forEach((val) => {
          if (val.isSelected) this.removeEntity(val)
          this.save();
        });
      });

      self.$markbtn = this.addButton(UmlitEditor.t("markAsAnswer"), () => {
        this.entities.forEach((val) => {
          if (val.isSelected) val.setIsAnswer(true);
        });
        this.save();
        this.clearSelection();
      });

      self.$unmarkbtn = this.addButton(UmlitEditor.t("unmarkAsAnswer"), () => {
        this.entities.forEach((val) => {
          if (val.isSelected) val.setIsAnswer(false);
        });
        this.save();
        this.clearSelection();
      });
    }

    addButton(label, clickCallback) {
      return $('<button>', {
        'type': 'button',
        'class': 'umlit-button'
      }).html(label).on("click", (e) => {
        clickCallback();
        this.refreshUMLClasses();
      }).appendTo(this.menu);

    }

    save() {
      this.params = {
        entities: this.entities.map(entity => {
          return { attributes: entity.attributes, methods: entity.methods, className: entity.className };
        }),
        answers: this.entities.map((entity, index) => {
          if (entity.isAnswer)
            return index
          else undefined;
        }).filter((el) => el !== undefined) // Filter entities where isAnswer is true
      };

      console.log(this.field, this.params.entities);
      this.setValue(this.field, JSON.stringify(this.params));
    };

    htmlDecode(htmlEncoded) {
      return $("<div/>").html(htmlEncoded).text();
    }

    validate() {
      return this.entities
        .some((entity) => entity.isAnswer);
    };

    static t = (key, params) => {
      return H5PEditor.t('H5PEditor.UMLEditor', key, params);
    };
  }

  return UmlitEditor;
})(H5P.jQuery);