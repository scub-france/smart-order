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

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

@RestController
@RequestMapping("/v1/validate")
public class ActorValidatorController {

    @Autowired
    private ActorValidatorService actorValidatorService;

    private Logger logger = Logger.getLogger(ActorValidatorController.class.getName());

    @RequestMapping("/test")
    public ResponseEntity<JSONObject> test() {
        Map map = new HashMap();
        map.put("test","Api deployed in V1");
        JSONObject response = new JSONObject(map);
        logger.log(Level.INFO, "Api test method called");
        return ResponseEntity
                .ok()
                .body(response);
    }


    @PostMapping(path = "/doctor", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> checkDoctorValidity(@RequestBody String body) {
        String response = actorValidatorService.checkStakeHolderValidity(body, ActorType.DOCTOR);
        logger.log(Level.INFO, "Doctor validation called for : " + body + ", result : " + response);
        return ResponseEntity
                .ok()
                .body(response);
    }

    @PostMapping(path = "/pharmacist", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> checkPharmacistValidity(@RequestBody String body) {
        String response = actorValidatorService.checkStakeHolderValidity(body, ActorType.PHARMACIST);
        logger.log(Level.INFO, "Pharmacist validation called for : " + body + ", result : " + response);
        return ResponseEntity
                .ok()
                .body(response);
    }

    @PostMapping(path = "/doctor", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> checkDoctorsValidity(@RequestBody List<String> body) {
        List<String> validatedDoctors = actorValidatorService.checkStakeHoldersValidity(body, ActorType.DOCTOR);
        return ResponseEntity
                .ok()
                .body("Doctor validated : " + validatedDoctors.toString());
    }

    @PostMapping(path = "/pharmacist", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> checkPharmacistsValidity(@RequestBody List<String> body) {
        List<String> validatedPharmacists = actorValidatorService.checkStakeHoldersValidity(body, ActorType.PHARMACIST);
        return ResponseEntity
                .ok()
                .body("Pharmacist validated : " + validatedPharmacists.toString());
    }


}
