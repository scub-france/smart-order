package com.smartorder.actorvalidatorapi.service.actor.impl;

import com.smartorder.actorvalidatorapi.model.ActorType;
import com.smartorder.actorvalidatorapi.service.parser.GenericJsonParser;
import com.smartorder.actorvalidatorapi.service.actor.ActorValidatorService;
import com.smartorder.actorvalidatorapi.utils.ActorsConstants;
import com.smartorder.actorvalidatorapi.utils.ActorUtils;
import org.json.simple.JSONObject;
import org.json.simple.parser.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class ActorValidatorServiceImpl implements ActorValidatorService {

    @Autowired
    private GenericJsonParser genericJsonParser;

    @Override
    public List<String> checkStakeHoldersValidity(List<String> issuedStakeHolders, ActorType typeStakeHolder){
        List<String> validatedStakeHolder = new ArrayList<>();
        for (String issuancePublicKey : issuedStakeHolders) {
            try {
                JSONObject stakeHolder = genericJsonParser.readJsonFile(typeStakeHolder, issuancePublicKey);
                if (isStakeHolderValid(stakeHolder)){
                    validatedStakeHolder.add(issuancePublicKey);
                }else {

                }
            } catch (IOException | ParseException e) {
                e.printStackTrace();
            }
        }
        return validatedStakeHolder;
    }

    @Override
    public JSONObject checkStakeHolderValidity(String issuedStakeHolders, ActorType typeStakeHolder) {
        try {
            JSONObject stakeHolder = genericJsonParser.readJsonFile(typeStakeHolder, issuedStakeHolders);
            if (stakeHolder == null){
                return new JSONObject(ActorUtils.getErrorResponse());
            }
            return new JSONObject(ActorUtils.getResult(issuedStakeHolders));
        } catch (IOException | ParseException e) {
            return new JSONObject(ActorUtils.getErrorResponse());
        }
    }

    private boolean isStakeHolderValid(JSONObject stakeHolder) {
        if (stakeHolder != null){
            return ActorUtils.iSvalidStrToBoolean((String) stakeHolder.get(ActorsConstants.IS_VALID));
        }
        return false;
    }
}
