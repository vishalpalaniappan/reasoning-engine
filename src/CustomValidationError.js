class CustomValidationErrorManager  {
    constructor() {
        this.validationErrors = [];
    }

    addError(type, error) {
        this.validationErrors.push({
            type: type,
            error: error
        })
    }
}

const errorManager = new CustomValidationErrorManager();

export default errorManager;