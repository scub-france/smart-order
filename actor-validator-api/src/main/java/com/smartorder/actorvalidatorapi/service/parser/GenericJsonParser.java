package com.smartorder.actorvalidatorapi.service.parser;

import com.smartorder.actorvalidatorapi.model.ActorType;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStreamReader;

@Component
public class GenericJsonParser {

    @Autowired
    private ResourceLoader resourceLoader;

    public JSONObject readJsonFile(ActorType stakeHolerType, String stakeHolderPubKey) throws IOException, ParseException {
        JSONParser parser = new JSONParser();
        String fileName = stakeHolerType.getCode() + "-valid.json";
        Resource resource = resourceLoader.getResource("classpath:"+stakeHolerType.getCode()+"/"+fileName);
        JSONObject result = (JSONObject) parser.parse(new InputStreamReader(resource.getInputStream()));
        if (result != null){
            return (JSONObject) result.get(stakeHolderPubKey);
        }
        return null;
    }




}
