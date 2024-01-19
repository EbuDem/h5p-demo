"use strict";
var DEBUG = true;


var H5P = H5P || {};

H5P.UML = (function ($) {
  class Umlit {
   
    constructor(options, id) {
      this.options = $.extend(true, {}, {});
      this.exercises = [];
      this.id = id;
      this.multiSelect = true;
      this.fetchExercises();
      H5P.EventDispatcher.call(this);
    }

    async fetchExercises() {
      try {
        const response = await fetch(H5P.getPath("content/umlit-manifest.json", this.id));
        const arrayJson = await response.json();

        const totalCount = arrayJson.exercises.length;
        let fetchedCount = 0;

        for (let exercise of arrayJson.exercises) {
          const exerciseResponse = await fetch(H5P.getPath(`content/${exercise}`, this.id));
          const exerciseJson = await exerciseResponse.json();

          this.exercises.push(exerciseJson);
          fetchedCount++;

          if (fetchedCount === totalCount && this.onLoadedExercises) {
            this.onLoadedExercises(this.exercises);
          }
        }
      } catch (error) {
        console.error("Error fetching exercises:", error);
      }
    }

    onLoadedExercises(exercises) {
      console.log("onLoadedExercises");

      this.currrentExerciseIndex = 0;
      this.refreshElements(this.getCurrentExercise());
    }

    getCurrentExercise()
    {
      return this.exercises[this.currrentExerciseIndex]
    };

    loadNextExercise()
    {
      if(this.currrentExerciseIndex+1 < this.exercises.length)
      {
        this.currrentExerciseIndex++;
        this.refreshElements(this.getCurrentExercise());
        return true;
      }
      return false;
    }

    refreshElements(exercise) {
      this.entities = exercise.entities.map(entity => new UMLClass(entity.name, entity.attributes, entity.methods));
      this.promptText.html(exercise.prompt)

      this.display.html("");

      this.entities.forEach(element => {
        element.domElement.appendTo(this.display)
        element.domElement.on("click", (event) => {
          this.onSelectedElement(element);
        })
      });

      this.checkNextButtonState();
    }

    onSelectedElement(entity)
    {
      console.log("onSelectedElement", entity)
      if(this.multiSelect)
      {
        entity.highlight = !entity.highlight; // toggle highlight;
        entity.refreshDOMElement();
    
      }else {
        // remove highlight from all others
        console.log(this.entities)
        this.entities.forEach(element =>
          {
              element.highlight = false;
              element.refreshDOMElement();
          });

        // highlight this
        entity.highlight = true;
        entity.refreshDOMElement();
      }

      this.checkNextButtonState();
    }


    checkNextButtonState()
    {
      if(!this.isAnySelected())
        this.disableNext();
      else
        this.enableNext();
    }
    disableNext()
    {
      console.log("disableNext");
      this.nextButton.prop("disabled",true)
    }

    enableNext()
    {
      console.log("enableNext");
      this.nextButton.prop("disabled",false)
    }

    isAnySelected() 
    {
      return this.entities.some(element  => element.highlight === true);
    }

    attach($container) {
      $container.attr('id', "h5p-umlit-draganddrop");

      this.mainWrapper = $('<div>', { 'id': "umlit-main" }).appendTo($container);
      this.promptText = $('<div>', { 'class': 'umlit-prompt-text' }).appendTo(this.mainWrapper);
      this.display = $('<div>', { 'class' : 'umlit-display'}).appendTo(this.mainWrapper);
      this.navigation = $('<div>', { 'class' : 'umlit-navigation'}).appendTo(this.mainWrapper);

      this.attachButton(this.navigation);
    }

    attachButton(parent) {
      this.previousButton = $('<button>', { 'class': "umlit-button umlit-navigation-previous", 'type': 'button' }).appendTo(parent);
      $(this.previousButton).html("Previous");
      this.previousButton.on('click', (e) => {
        console.log("previousButton.click()")
      });

      this.nextButton = $('<button>', { 'class': "umlit-button umlit-navigation-next", 'type': 'button' }).appendTo(parent);
      $(this.nextButton).html("Next");
      this.nextButton.on('click', (e) => {
        console.log("nextButton.click()")
        this.loadNextExercise();
      });
    }
  }


  return Umlit;
})(H5P.jQuery);
