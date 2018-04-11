package com.smartorder.actorvalidatorapi.predicate;

public class ActorValidatorPredicates {

    // TODO Manage null keys before and return Predicate
    public static boolean isStakeHolderValid(String localpublickey, String issuancePublickey){
        return(localpublickey != null && issuancePublickey != null) && (localpublickey.equals(issuancePublickey));
    }
}
