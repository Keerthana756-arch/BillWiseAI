package com.billwiseai.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebForwardController {

    @GetMapping(value = {
        "/login",
        "/register",
        "/dashboard",
        "/bills",
        "/bills/{id:[0-9]+}",
        "/upload",
        "/analytics",
        "/insights",
        "/ask-ai",
        "/notifications",
        "/settings"
    })
    public String forwardClientRoutes() {
        return "forward:/index.html";
    }
}
