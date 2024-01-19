"use strict";
var DEBUG = true;


var H5P = H5P || {};
H5P.UML = (function ($) {
  class Umlit extends H5P.EventDispatcher {

    constructor(options, id) {
      super();
      this.options = $.extend(true, {}, {});
      this.exercises = [];
      this.id = id;
      this.multiSelect = false;
      this.fetchExercises();
      H5P.EventDispatcher.call(this);
      H5P.externalDispatcher.on('xAPI', function (event) {
        console.log(event.data.statement)
      });

      this.on("xAPI", function (event) {
        console.log(event);
      })

      this.trigger("xAPI");


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

          exerciseJson.entities = exerciseJson.entities.map(entity => new UMLClass(entity.name, entity.attributes, entity.methods));
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

    attach($container) {
      $container.attr('id', "h5p-umlit-draganddrop");

      this.container = $container;
      this.mainWrapper = $('<div>', { 'id': "umlit-main" }).appendTo($container);
      this.promptText = $('<div>', { 'class': 'umlit-prompt-text' }).appendTo(this.mainWrapper);
      this.display = $('<div>', { 'class': 'umlit-display' }).appendTo(this.mainWrapper);
      this.navigation = $('<div>', { 'class': 'umlit-navigation' }).appendTo(this.mainWrapper);

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
      this.nextButton.on('click', () => this.onNext());
    }

    showResultPage() {
      console.log("showResultPage()")
      let testScore = 0; // TODO: Remove this

      this.promptText.remove();
      this.display.remove()
      this.navigation.remove();
      this.sumScore = 0;
      this.resultPage = $('<div>', { 'class': "umlit-result" });
      $('<h2>', { 'id': 'umlit-title' }).html("Results").appendTo(this.resultPage);
      this.exercises.forEach((exercise, index) => {
        let resultItem = $('<div>', { 'class': "umlit-result-item" })
        let exerciseName = `${index + 1}. ${exercise.entities[0].className}`;
        // TODO: calculate real score
        let exerciseScore = testScore;
        testScore += 50;
        console.log(exerciseName, exerciseScore);
        this.sumScore += exerciseScore;
        if (exerciseScore == 0)
          resultItem.addClass("umlit-result-item-wrong")
        else if (exerciseScore == 100)
          resultItem.addClass("umlit-result-item-right")
        else
          resultItem.addClass("umlit-result-item-partial");

        let resultItemNaming = $("<span>", { 'class': "umlit-result-item-name" })
        resultItemNaming.html(exerciseName);
        resultItemNaming.appendTo(resultItem);

        let resultItemScore = $("<span>", { 'class': "umlit-result-item-score" })
        resultItemScore.html(exerciseScore);
        resultItemScore.appendTo(resultItem);

        resultItem.appendTo(this.resultPage);
      });

      this.resultPage.appendTo(this.mainWrapper);
      this.triggerXAPIScored(this.sumScore, 300, 'completed');
    
    }

    refreshElements(exercise) {
      this.promptText.html(exercise.prompt)
      this.entities = exercise.entities;

      this.display.html("");

      this.entities.forEach(element => {
        element.domElement.appendTo(this.display)
        element.domElement.on("click", (event) => {
          this.onSelectedElement(element);
        })
      });

      this.checkNextButtonState();
    }

    onSelectedElement(entity) {
      console.log("onSelectedElement(entity)");
      if (this.multiSelect) {
        entity.isSelected = !entity.isSelected; // toggle highlight;
        entity.refreshDOMElement();

      } else {
        this.entities.forEach(element => {
          element.isSelected = false;
          element.refreshDOMElement();
        });

        // highlight this
        entity.isSelected = true;
        entity.refreshDOMElement();
      }
      this.checkNextButtonState();
    }

    checkNextButtonState() {
      if (!this.isAnySelected())
        this.disableNext();
      else
        this.enableNext();


    }
    disableNext() {
      console.log("disableNext()");
      this.nextButton.prop("disabled", true)
    }

    enableNext() {
      console.log("enableNext()");
      this.nextButton.prop("disabled", false)
    }

    onLoadedExercises(exercises) {
      console.log("onLoadedExercises");

      this.currrentExerciseIndex = 0;
      this.refreshElements(this.getCurrentExercise());

      this.showResultPage();
    }

    getCurrentExercise() {
      return this.exercises[this.currrentExerciseIndex]
    };

    loadNextExercise() {
      if (this.currrentExerciseIndex + 1 < this.exercises.length) {
        this.currrentExerciseIndex++;
        this.refreshElements(this.getCurrentExercise());
        return true;
      }
      return false;
    }

    isAnySelected() {
      return this.entities.some(element => element.isSelected === true);
    }

    saveAnswer() {
      this.getCurrentExercise().userAnswer = this.entities.filter(entity => entity.isSelected === true)
    }

    onNext() {
      console.log("onNext()")
      this.saveAnswer()
      if (!this.loadNextExercise()) {
        this.showResultPage();
        console.log(this)
      }
    }

    isLastExercise() {
      return this.currrentExerciseIndex.length + 1 >= this.exercises.length;
    }
  }


  return Umlit;
})(H5P.jQuery);
