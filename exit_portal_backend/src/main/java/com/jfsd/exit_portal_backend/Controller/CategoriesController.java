package com.jfsd.exit_portal_backend.Controller;

import com.jfsd.exit_portal_backend.Model.Categories;
import com.jfsd.exit_portal_backend.Repository.CategoriesRepository;
import com.jfsd.exit_portal_backend.Service.CategoriesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import org.springframework.web.bind.annotation.PostMapping;

@RestController
@RequestMapping("/api/categories")
public class CategoriesController {

    @Autowired
    private CategoriesService categoriesService;

    @Autowired
    private CategoriesRepository categoriesRepository;

    // @GetMapping("/getbyname")
    // public Categories name(@RequestParam String name){
    //     return categoriesRepository.findByCategoryName(name);
    // }
    // ... other methods ...
    @GetMapping("/getall")
    public List<Categories> getAllCategories() {
        return categoriesRepository.findAll();
    }



    @PostMapping("/populate")
    public ResponseEntity<String> populateCategoriesFromCSV(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a CSV file to upload.");
        }

        try {
            categoriesService.populateCategoriesFromCSV(file);
            return ResponseEntity.ok("Categories populated successfully");
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to process the CSV file: " + e.getMessage());
        }
    }
}