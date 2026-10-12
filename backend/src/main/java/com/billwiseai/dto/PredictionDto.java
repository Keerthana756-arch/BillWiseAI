package com.billwiseai.dto;

import java.util.Map;

public class PredictionDto {

    private double estimatedNextMonthTotal;
    private double rangeMin;
    private double rangeMax;
    private int historicalBillCount;
    private boolean sufficientData;
    private String confidenceLevel;
    private String explanation;
    private Map<String, Double> categoryEstimates;

    public PredictionDto() {
    }

    public double getEstimatedNextMonthTotal() {
        return estimatedNextMonthTotal;
    }

    public void setEstimatedNextMonthTotal(double estimatedNextMonthTotal) {
        this.estimatedNextMonthTotal = estimatedNextMonthTotal;
    }

    public double getRangeMin() {
        return rangeMin;
    }

    public void setRangeMin(double rangeMin) {
        this.rangeMin = rangeMin;
    }

    public double getRangeMax() {
        return rangeMax;
    }

    public void setRangeMax(double rangeMax) {
        this.rangeMax = rangeMax;
    }

    public int getHistoricalBillCount() {
        return historicalBillCount;
    }

    public void setHistoricalBillCount(int historicalBillCount) {
        this.historicalBillCount = historicalBillCount;
    }

    public boolean isSufficientData() {
        return sufficientData;
    }

    public void setSufficientData(boolean sufficientData) {
        this.sufficientData = sufficientData;
    }

    public String getConfidenceLevel() {
        return confidenceLevel;
    }

    public void setConfidenceLevel(String confidenceLevel) {
        this.confidenceLevel = confidenceLevel;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public Map<String, Double> getCategoryEstimates() {
        return categoryEstimates;
    }

    public void setCategoryEstimates(Map<String, Double> categoryEstimates) {
        this.categoryEstimates = categoryEstimates;
    }
}
