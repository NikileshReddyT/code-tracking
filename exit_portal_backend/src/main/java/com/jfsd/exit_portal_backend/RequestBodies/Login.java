package com.jfsd.exit_portal_backend.RequestBodies;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Login {

    private String universityId;
    private String password;

}
