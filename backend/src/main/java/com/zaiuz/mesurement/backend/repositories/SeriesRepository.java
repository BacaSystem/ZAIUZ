package com.zaiuz.mesurement.backend.repositories;

import com.zaiuz.mesurement.backend.domain.Series;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SeriesRepository extends JpaRepository<Series, UUID> {
}
