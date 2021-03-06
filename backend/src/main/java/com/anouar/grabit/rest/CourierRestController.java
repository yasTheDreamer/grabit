package com.anouar.grabit.rest;

import com.anouar.grabit.model.Courier;

import com.anouar.grabit.service.CourierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

@RestController
@CrossOrigin(exposedHeaders = "errors, content-type", allowCredentials = "true")
@RequestMapping("api/drivers")

public class CourierRestController {


    @Autowired
    CourierService service;


    private Logger LOG = Logger.getLogger(this.getClass().getName());

    private static String KEY = "CUSTOMERS";

    @PostMapping("/save")
    public ResponseEntity<String> saveDriver(@RequestBody Courier courier, HttpServletRequest request)
    {


        if(!service.courierExists(courier)){

            service.saveCourier(courier);
            UserRestController.generateSession(request, KEY, courier);



        } else {
            return new ResponseEntity<String>("User with this email already exists", HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<>(null, HttpStatus.OK);
    }


    @PostMapping("/setState")
    public ResponseEntity<String> setState(@RequestBody Courier courier){

        Courier courierToSubmit = service.findCourierByEmail(courier.getEmail());

        if(courierToSubmit != null) {
            courierToSubmit.setActif(courier.getActif());
            service.saveCourier(courierToSubmit);
        }
        return new ResponseEntity<>(null, HttpStatus.OK);
    }

    @PostMapping("/getState")
    public ResponseEntity<Boolean> getState(@RequestBody Courier courier){
        Boolean state = service.findCourierById(courier.getId()).getActif();
        return new ResponseEntity<>(state, HttpStatus.OK);
    }


}
