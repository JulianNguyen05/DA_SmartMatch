package com.worklify.domain.candidate.repository;

import com.worklify.domain.candidate.model.CandidateProfileLayout;

import java.util.List;

public interface CandidateProfileLayoutRepository {

    /** Lấy toàn bộ layout của 1 candidate, sắp theo position tăng dần. */
    List<CandidateProfileLayout> findByCandidateId(Long candidateId);

    /** true nếu candidate đã có layout trong DB (đã từng khởi tạo). */
    boolean existsByCandidateId(Long candidateId);

    /** Lưu hàng loạt — dùng cho cả khởi tạo lần đầu lẫn reorder/toggle nhiều block cùng lúc. */
    List<CandidateProfileLayout> saveAll(List<CandidateProfileLayout> layouts);
}