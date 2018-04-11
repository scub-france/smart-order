package com.smartorder.actorvalidatorapi.controller;

import com.smartorder.actorvalidatorapi.model.ActorType;
import com.smartorder.actorvalidatorapi.service.actor.ActorValidatorService;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/validate")
public class ActorValidatorController {

    @Autowired
    private ActorValidatorService actorValidatorService;

    @PostMapping(path = "/doctor", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JSONObject> checkDoctorValidity(@RequestBody String body) {
        JSONObject response = actorValidatorService.checkStakeHolderValidity(body, ActorType.DOCTOR);
        return ResponseEntity
                .ok()
                .body(response);
    }

    @PostMapping(path = "/pharmacist", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JSONObject> checkPharmacistValidity(@RequestBody String body) {
        JSONObject response = actorValidatorService.checkStakeHolderValidity(body, ActorType.PHARMACIST);
        return ResponseEntity
                .ok()
                .body(response);
    }

    @PostMapping(path = "/doctors", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> checkDoctorsValidity(@RequestBody List<String> body) {
        List<String> validatedDoctors = actorValidatorService.checkStakeHoldersValidity(body, ActorType.DOCTOR);
        return ResponseEntity
                .ok()
                .body("Doctor validated : " + validatedDoctors.toString());
    }

    @PostMapping(path = "/pharmacists", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> checkPharmacistsValidity(@RequestBody List<String> body) {
        List<String> validatedPharmacists = actorValidatorService.checkStakeHoldersValidity(body, ActorType.PHARMACIST);
        return ResponseEntity
                .ok()
                .body("Pharmacist validated : " + validatedPharmacists.toString());
    }


}
