package com.smartorder.actorvalidatorapi.service.actor;

import com.smartorder.actorvalidatorapi.model.ActorType;
import org.json.simple.JSONObject;

import java.util.List;

public interface ActorValidatorService {

    List<String> checkStakeHoldersValidity(List<String> issuedStakeHolders, ActorType typeStakeHolder);

    JSONObject checkStakeHolderValidity(String issuedStakeHolders, ActorType typeStakeHolder);
}
