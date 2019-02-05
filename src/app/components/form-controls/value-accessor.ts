import {ControlValueAccessor} from '@angular/forms';

export class ValueAccessor<T> implements ControlValueAccessor {
    private innerValue: T;

    private onChange: (value: T) => void;

    get value(): T {
        return this.innerValue;
    }

    set value(value: T) {
        if (this.innerValue !== value) {
            this.innerValue = value;
            this.onChange(value);
        }
    }

    touch() {

    }

    // writes a new value from the form model into the view
    writeValue(value: T) {
        this.innerValue = value;

        this.onWriteValue(value);
    }

    // registers a handler that should be called when something in the view has changed
    registerOnChange(fn: (value: T) => void) {
        this.onChange = fn;
    }

    // from interface
    registerOnTouched(fn: () => void) {
    }

    onWriteValue(value: T) {
    }
}
