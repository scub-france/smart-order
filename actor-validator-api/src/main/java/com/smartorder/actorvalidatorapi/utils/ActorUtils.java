package com.smartorder.actorvalidatorapi.utils;

import org.json.simple.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class ActorUtils {

    public static boolean iSvalidStrToBoolean(String isValidStr){
        if ("true".equals(isValidStr)){
            return true;
        }else{
            return false;
        }
    }

    public static Map getErrorResponse(){
        Map error = new HashMap();
        error.put("pubKey" , "0");
        return error;
    }

    public static Map getResult(String actor){
        Map result = new HashMap();
        result.put("pubKey" , actor);
        return result;
    }

}
