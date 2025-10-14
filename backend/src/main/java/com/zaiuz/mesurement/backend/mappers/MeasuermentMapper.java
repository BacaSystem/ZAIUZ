package com.zaiuz.mesurement.backend.mappers;

import com.zaiuz.mesurement.backend.domain.Measurement;
import com.zaiuz.mesurement.backend.domain.dto.MeasurementDto;
import org.modelmapper.ModelMapper;

public class MeasuermentMapper implements Mapper<Measurement, MeasurementDto> {

    private final ModelMapper modelMapper;

    public MeasuermentMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    @Override
    public MeasurementDto mapTo(Measurement measurement) {
        return modelMapper.map(measurement, MeasurementDto.class);
    }

    @Override
    public Measurement mapFrom(MeasurementDto measurementDto) {
        return modelMapper.map(measurementDto, Measurement.class);
    }
}
