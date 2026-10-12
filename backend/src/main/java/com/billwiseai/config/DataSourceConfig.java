package com.billwiseai.config;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        String url = properties.getUrl();
        if (url != null) {
            // Support Render / Heroku / Railway postgres:// or postgresql:// formats
            if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
                try {
                    URI uri = URI.create(url);
                    String host = uri.getHost();
                    int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                    String path = uri.getPath();
                    String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
                    properties.setUrl(jdbcUrl);

                    String userInfo = uri.getUserInfo();
                    if (userInfo != null && userInfo.contains(":")) {
                        String[] parts = userInfo.split(":", 2);
                        properties.setUsername(parts[0]);
                        properties.setPassword(parts[1]);
                    }
                } catch (Exception ignored) {}
            } else if (url.startsWith("mysql://")) {
                try {
                    URI uri = URI.create(url);
                    String host = uri.getHost();
                    int port = uri.getPort() == -1 ? 3306 : uri.getPort();
                    String path = uri.getPath();
                    String jdbcUrl = "jdbc:mysql://" + host + ":" + port + path + "?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
                    properties.setUrl(jdbcUrl);

                    String userInfo = uri.getUserInfo();
                    if (userInfo != null && userInfo.contains(":")) {
                        String[] parts = userInfo.split(":", 2);
                        properties.setUsername(parts[0]);
                        properties.setPassword(parts[1]);
                    }
                } catch (Exception ignored) {}
            }
        }
        return properties.initializeDataSourceBuilder().build();
    }
}
