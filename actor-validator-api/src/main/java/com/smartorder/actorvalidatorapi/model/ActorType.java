package com.smartorder.actorvalidatorapi.model;

public enum ActorType {

    PHARMACIST("pharmacist"), DOCTOR("doctor");

    private String code;

    ActorType(String code) {
        this.code = code;
    }

    public String getCode(){
        return this.code;
    }

}
