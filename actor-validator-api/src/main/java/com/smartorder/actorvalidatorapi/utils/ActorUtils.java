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

    public static String getErrorResponse(){
        return "0";
    }

    public static String getResult(String actor){
        return "1";
    }

}
