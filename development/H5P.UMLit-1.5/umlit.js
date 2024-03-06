"use strict";
var DEBUG = true;
var H5P = H5P || {};
var UMLClass = H5P.UMLClass;

H5P.UMLit = (function ($) {
  class UMLit extends H5P.EventDispatcher {

    constructor(options, id) {
      super();
      this.options = options;
      this.exercises = [];
      this.id = id;
      this.multiSelect = false;

      console.log("hmm",H5P.UMLClass);
      H5P.EventDispatcher.call(this);
      H5P.externalDispatcher.on('xAPI', function (event) {
        console.log(event.data.statement)
      });

      this.on("xAPI", function (event) {
        console.log(event);
      })
    }

    async fetchExercise() {
      console.log("fetchExercise");
      var decoded = $("<div/>").html(this.options.exercise).text();
      let parsedExercise = JSON.parse(decoded);

      this.entities = parsedExercise.entities.map(parsedEntity => new UMLClass($, parsedEntity.className, parsedEntity.attributes, parsedEntity.methods));
      this.entities.forEach(element => element.domElement.appendTo(this.display));
      this.answers = parsedExercise.answers;

      if(this.answers.length > 1)
        this.multiSelect = true;
    }

    attach($container) {
      console.log("H5P.attach()")
      $container.attr('id', "h5p-umlit-draganddrop");

      this.container = $container;
      this.mainWrapper = $('<div>', { 'id': "umlit-main" }).appendTo($container);
      this.promptText = $('<div>', { 'class': 'umlit-prompt-text' }).appendTo(this.mainWrapper);
      this.display = $('<div>', { 'class': 'umlit-display' }).appendTo(this.mainWrapper);
      this.navigation = $('<div>', { 'class': 'umlit-navigation' }).appendTo(this.mainWrapper);

      $(document).ready(() => {
        this.fetchExercise();
        this.attachButton(this.navigation);
        this.promptText.html(this.options.prompt)

        this.entities.forEach(element => {
          element.domElement.on("click", (event) => {
            this.onSelectedElement(element);
          })
        });
      });
    }

    attachButton(parent) {
      this.previousButton = $('<button>', { 'class': "umlit-button umlit-navigation-previous", 'type': 'button' }).appendTo(parent);
      $(this.previousButton).html("Previous");
      this.previousButton.on('click', (e) => {
        console.log("previousButton.click()")
      });

      this.nextButton = $('<button>', { 'class': "umlit-button umlit-navigation-next", 'type': 'button' }).appendTo(parent);
      $(this.nextButton).html("Finish");
      this.nextButton.on('click', () => this.onNext());
    }

    showResultPage() {
      console.log("showResultPage()")
      this.promptText.remove();
      this.display.remove()
      this.navigation.remove();
      this.sumScore = 0;
      this.resultPage = $('<div>', { 'class': "umlit-result" });
      let exerciseName =  this.entities[0].className;
      $('<h2>', { 'id': 'umlit-title' }).html(`Results for ${exerciseName}`).appendTo(this.resultPage);

      // TODO: calculate real score
      let userAnswers = this.entities.map((entity, index) => {
        if(entity.isSelected)
         return index
       else undefined;
     }).filter((el) => el !== undefined)

      let count = this.countMatchingElements(userAnswers, this.answers);


      this.sumScore  = (100/this.answers.length) * count;
      
      console.log("Matching answers", this.sumScore);
      this.resultPage.appendTo(this.mainWrapper);
      $('<h2>', { 'id': 'umlit-title' }).html(`${this.sumScore}/100`).appendTo(this.resultPage);
      this.triggerXAPIScored(this.sumScore, 100, 'completed');
    }

    refreshElements(exercise) {
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

      this.refreshElements(this.getCurrentExercise());
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
      this.userAnswer = this.entities.filter(entity => entity.isSelected === true)
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

    countMatchingElements(...arrays) {
      // Convert arrays to sets
      const sets = arrays.map(arr => new Set(arr));
    
      // Find the smallest set
      const smallestSet = sets.reduce((minSet, currentSet) => (currentSet.size < minSet.size ? currentSet : minSet), sets[0]);
    
      // Count matching elements
      let matchingCount = 0;
    
      for (const element of smallestSet) {
        if (sets.every(set => set.has(element))) {
          matchingCount++;
        }
      }
    
      return matchingCount;
    }
  }


  return UMLit;
})(H5P.jQuery);
