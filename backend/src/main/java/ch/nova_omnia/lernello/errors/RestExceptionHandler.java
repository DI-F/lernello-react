package ch.nova_omnia.lernello.errors;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.stream.Collectors;

record ErrorBody(String message) {
}

@ControllerAdvice
public class RestExceptionHandler {
    // 400 – Bean Validation on @RequestBody
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorBody> handleNotValid(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
            .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(new ErrorBody(msg.isBlank() ? "Validation failed" : msg));
    }

    // 400 – @RequestParam/@PathVar validation
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorBody> handleConstraint(ConstraintViolationException ex) {
        return ResponseEntity.badRequest().body(new ErrorBody(ex.getMessage()));
    }

    // 400 – JSON parse/type errors
    @ExceptionHandler({
        MethodArgumentTypeMismatchException.class,
        org.springframework.http.converter.HttpMessageNotReadableException.class
    })
    public ResponseEntity<ErrorBody> handleBadRequest(Exception ex) {
        return ResponseEntity.badRequest().body(new ErrorBody("Bad request"));
    }

    // 401/422 – deine Businessfehler (z.B. ungültiger OTP-Code)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorBody> handleIllegal(IllegalArgumentException ex) {
        // Du kannst hier auch 422 senden, wenn dir das semantisch lieber ist.
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorBody(ex.getMessage()));
    }

    // 404 – no handler
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ErrorBody> handle404() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorBody("Not found"));
    }

    // 500 – Fallback
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorBody> handleAny(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorBody("Internal server error"));
    }
}
