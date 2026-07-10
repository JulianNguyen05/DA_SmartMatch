package com.worklify.infrastructure.persistence.mapper;

import com.worklify.domain.candidate.model.*;
import com.worklify.infrastructure.persistence.entity.*;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CandidateEntityMapper {

    CandidateProfileJpaEntity toEntity(CandidateProfile profile);
    CandidateProfile toDomain(CandidateProfileJpaEntity entity);

    CvDocumentJpaEntity toEntity(CvDocument document);
    CvDocument toDomain(CvDocumentJpaEntity entity);

    CandidateSkillJpaEntity toEntity(CandidateSkill candidateSkill);
    CandidateSkill toDomain(CandidateSkillJpaEntity entity);

    EducationJpaEntity toEntity(Education education);
    Education toDomain(EducationJpaEntity entity);

    ExperienceJpaEntity toEntity(Experience experience);
    Experience toDomain(ExperienceJpaEntity entity);

    ProjectJpaEntity toEntity(Project project);
    Project toDomain(ProjectJpaEntity entity);

    CertificationJpaEntity toEntity(Certification certification);
    Certification toDomain(CertificationJpaEntity entity);

    ActivityJpaEntity toEntity(Activity activity);
    Activity toDomain(ActivityJpaEntity entity);

    AwardJpaEntity toEntity(Award award);
    Award toDomain(AwardJpaEntity entity);

    HobbyJpaEntity toEntity(Hobby hobby);
    Hobby toDomain(HobbyJpaEntity entity);

    LanguageJpaEntity toEntity(Language language);
    Language toDomain(LanguageJpaEntity entity);

    CandidateProfileLayoutJpaEntity toEntity(CandidateProfileLayout layout);
    CandidateProfileLayout toDomain(CandidateProfileLayoutJpaEntity entity);
}