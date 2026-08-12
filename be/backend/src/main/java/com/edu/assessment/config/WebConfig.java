package com.edu.assessment.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Lấy đường dẫn tuyệt đối của thư mục local-storage/uploads/
        Path uploadDir = Paths.get("local-storage/uploads");
        String uploadPath = uploadDir.toFile().getAbsolutePath();

        // Cấu hình: Khi Frontend gọi /api/v1/files/ten-file.pdf
        // Spring Boot sẽ tìm file đó trong ổ cứng máy chủ và trả về trực tiếp
        registry.addResourceHandler("/api/v1/files/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}