-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql:3306
-- Generation Time: Jun 22, 2026 at 07:06 AM
-- Server version: 8.4.8
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `worklify_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `id` bigint NOT NULL,
  `candidate_id` bigint NOT NULL,
  `job_id` bigint NOT NULL,
  `cv_id` bigint DEFAULT NULL,
  `cover_letter` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING' COMMENT 'PENDING, REVIEWED, INTERVIEW_SCHEDULED, ACCEPTED, REJECTED',
  `applied_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `blind_test_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `applications`
--

INSERT INTO `applications` (`id`, `candidate_id`, `job_id`, `cv_id`, `cover_letter`, `status`, `applied_at`, `blind_test_url`) VALUES
(2, 2, 2, 2, 'Kính gửi HR, tôi muốn ứng tuyển Marketing...', 'PENDING', '2026-05-28 07:37:31', NULL),
(5, 5, 8, 5, 'Chào anh/chị, tôi apply vị trí DevOps...', 'REJECTED', '2026-05-28 07:37:31', NULL),
(8, 9, 9, 9, 'Tôi muốn làm Video Editor...', 'PENDING', '2026-05-28 07:37:31', NULL),
(12, 11, 11, 11, '', 'ACCEPTED', '2026-05-30 12:39:59', NULL),
(13, 11, 13, 11, '', 'PENDING', '2026-05-30 12:53:49', NULL),
(14, 11, 11, 12, '', 'ACCEPTED', '2026-06-01 12:57:37', NULL),
(15, 11, 11, 12, '', 'PENDING', '2026-06-01 13:12:08', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `candidate_profiles`
--

CREATE TABLE `candidate_profiles` (
  `id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `address` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `summary` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `candidate_profiles`
--

INSERT INTO `candidate_profiles` (`id`, `user_id`, `full_name`, `phone`, `gender`, `dob`, `address`, `summary`) VALUES
(1, 6, 'Nguyễn Văn An', '0901000006', 'MALE', '1995-05-10', 'Hà Nội', 'Lập trình viên Backend'),
(2, 7, 'Trần Thị Bình', '0901000007', 'FEMALE', '1998-02-15', 'TP.HCM', 'Chuyên viên Marketing / Content'),
(3, 8, 'Lê Hoàng Cường', '0901000008', 'MALE', '1990-11-20', 'Đà Nẵng', 'Quản lý dự án (Project Manager)'),
(4, 9, 'Phạm Thu Dung', '0901000009', 'FEMALE', '2000-01-01', 'Cần Thơ', 'Lập trình viên Frontend ReactJS'),
(5, 10, 'Hoàng Minh Tuấn', '0901000010', 'MALE', '1997-08-08', 'Hải Phòng', 'Chuyên gia phân tích dữ liệu (Data Analyst)'),
(6, 6, 'Nguyễn Văn An (Fullstack)', '0901000006', 'MALE', '1995-05-10', 'Hà Nội', 'Hồ sơ Fullstack Developer'),
(7, 7, 'Trần Thị Bình (SEO)', '0901000007', 'FEMALE', '1998-02-15', 'TP.HCM', 'Hồ sơ ứng tuyển chuyên viên SEO'),
(8, 8, 'Lê Hoàng Cường (Scrum)', '0901000008', 'MALE', '1990-11-20', 'Đà Nẵng', 'Hồ sơ Scrum Master'),
(9, 9, 'Phạm Thu Dung (UI/UX)', '0901000009', 'FEMALE', '2000-01-01', 'Cần Thơ', 'Thiết kế giao diện UI/UX'),
(10, 10, 'Hoàng Minh Tuấn (AI)', '0901000010', 'MALE', '1997-08-08', 'Hải Phòng', 'Kỹ sư trí tuệ nhân tạo'),
(11, 11, 'Nguyễn Hữu Trọngg', '0935918965', 'Nam', '2005-07-16', '185/95/35 Nguyễn Khuyến, Nha Trang, Khánh Hòa', 'Tôi là Julian (Nguyễn Hữu Trọng). Định hướng của tôi là trở thành một Full Stack Developer toàn diện, nơi tôi có thể tự tay tham gia vào toàn bộ vòng đời phát triển phần mềm. Từ việc lên ý tưởng, thiết kế kiến trúc, xây dựng tính năng đến triển khai hệ thống linh hoạt trên các nền tảng hiện đại, tôi luôn làm việc với sự tỉ mỉ và tinh thần trách nhiệm cao. Hiện tại, tôi đang tìm kiếm cơ hội cọ xát trong một môi trường công nghệ chuyên nghiệp để phát huy tối đa tư duy logic và bứt phá giới hạn của bản thân.'),
(12, 13, 'admin', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `candidate_skills`
--

CREATE TABLE `candidate_skills` (
  `candidate_id` bigint NOT NULL,
  `skill_id` bigint NOT NULL,
  `level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `years_of_ex` int DEFAULT '0',
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `candidate_skills`
--

INSERT INTO `candidate_skills` (`candidate_id`, `skill_id`, `level`, `years_of_ex`, `note`) VALUES
(1, 1, 'Senior', 5, 'Chuyên Spring Boot'),
(2, 6, 'Mid', 3, 'Chạy Facebook, Google Ads'),
(3, 8, 'Senior', 8, 'Chứng chỉ PMP'),
(4, 2, 'Junior', 1, 'Làm ReactJS'),
(5, 5, 'Mid', 4, 'Tối ưu hóa Database'),
(6, 4, 'Mid', 3, 'Code Node.js'),
(7, 9, 'Mid', 2, 'SEO Onpage & Offpage'),
(8, 8, 'Senior', 6, 'Scrum / Agile'),
(9, 7, 'Junior', 1, 'Biết dùng Figma'),
(10, 3, 'Senior', 5, 'Xử lý dữ liệu lớn với Python'),
(11, 11, 'Cơ bản', 0, 'Đang tìm hiểu'),
(11, 12, 'Cơ bản', 0, 'Đang trong quá trình nghiên cứu và thực hành kiến thức cơ bản'),
(11, 14, 'Cơ bản', 0, 'Mô tả về Vite'),
(11, 15, 'Cơ bản', 0, '');

-- --------------------------------------------------------

--
-- Table structure for table `company_likes`
--

CREATE TABLE `company_likes` (
  `id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `company_id` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `company_likes`
--

INSERT INTO `company_likes` (`id`, `user_id`, `company_id`, `created_at`) VALUES
(5, 8, 2, '2026-05-28 07:37:31'),
(8, 9, 11, '2026-05-28 07:37:31'),
(11, 11, 11, '2026-05-28 16:41:46'),
(12, 11, 8, '2026-06-01 12:57:10'),
(13, 11, 24, '2026-06-01 12:57:12'),
(14, 11, 2, '2026-06-01 13:11:32'),
(15, 11, 9, '2026-06-01 13:11:37');

-- --------------------------------------------------------

--
-- Table structure for table `company_profiles`
--

CREATE TABLE `company_profiles` (
  `id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `verification_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING' COMMENT 'PENDING, APPROVED, REJECTED'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `company_profiles`
--

INSERT INTO `company_profiles` (`id`, `user_id`, `company_name`, `logo_url`, `website`, `description`, `verification_status`) VALUES
(2, 3, 'Global Solutions Ltd.', '/uploads/logos/global.jpg', 'https://global.vn', 'Giải pháp IT toàn cầu', 'APPROVED'),
(8, 5, 'NextGen Cloud', '/uploads/logos/ncloud.jpg', 'https://cloud.nextgen.com', 'Hạ tầng điện toán đám mây', 'APPROVED'),
(9, 2, 'TechVN Media', '/uploads/logos/media.jpg', 'https://media.techvn.vn', 'Truyền thông đa phương tiện', 'APPROVED'),
(11, 12, 'Công ty A', '/uploads/companies/logos/logo_owner_12_z7840188237923_6c3b35f7529893510f4e67160475c164_1.png', 'https://www.facebook.com/', 'Đây là giới thiệu của công ty A', 'APPROVED'),
(22, 20, 'Công ty Công nghệ Alpha', '/uploads/companies/logos/logo3.jpg', 'https://alpha-tech.vn', 'Mô tả công ty Alpha đang chờ duyệt', 'APPROVED'),
(23, 21, 'Giải pháp số Beta', '/uploads/companies/logos/logo3.jpg', 'https://beta-solutions.com', 'Cung cấp giải pháp phần mềm', 'PENDING'),
(24, 22, 'Truyền thông Gamma', '/uploads/companies/logos/logo3.jpg', 'https://gamma-media.vn', 'Công ty truyền thông và quảng cáo', 'PENDING'),
(25, 23, 'Thương mại Delta', '/uploads/companies/logos/logo3.jpg', 'https://delta-trade.com', 'Kinh doanh xuất nhập khẩu', 'PENDING'),
(26, 24, 'Dịch vụ Epsilon', '/uploads/companies/logos/logo3.jpg', 'https://epsilon-services.vn', 'Cung cấp dịch vụ hỗ trợ doanh nghiệp', 'PENDING');

-- --------------------------------------------------------

--
-- Table structure for table `cv_documents`
--

CREATE TABLE `cv_documents` (
  `id` bigint NOT NULL,
  `candidate_id` bigint NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `raw_text` longtext COLLATE utf8mb4_unicode_ci COMMENT 'LÆ°u dá»¯ liá»‡u JSON náº¿u á»©ng viÃªn dÃ¹ng cÃ´ng cá»¥ táº¡o CV (CV Builder)',
  `is_generated` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cv_documents`
--

INSERT INTO `cv_documents` (`id`, `candidate_id`, `file_name`, `file_path`, `raw_text`, `is_generated`, `created_at`) VALUES
(1, 1, NULL, '/uploads/cvs/cv_1.pdf', NULL, 0, '2026-05-28 07:37:31'),
(2, 2, NULL, '/uploads/cvs/cv_2.pdf', NULL, 0, '2026-05-28 07:37:31'),
(3, 3, NULL, '/uploads/cvs/cv_3.pdf', NULL, 0, '2026-05-28 07:37:31'),
(4, 4, NULL, '/uploads/cvs/cv_4.pdf', NULL, 0, '2026-05-28 07:37:31'),
(5, 5, NULL, '/uploads/cvs/cv_5.pdf', NULL, 0, '2026-05-28 07:37:31'),
(6, 6, NULL, NULL, '{\"education\": \"Đại học Bách Khoa\"}', 1, '2026-05-28 07:37:31'),
(7, 7, NULL, NULL, '{\"education\": \"Đại học Kinh tế\"}', 1, '2026-05-28 07:37:31'),
(8, 8, NULL, '/uploads/cvs/cv_8.pdf', NULL, 0, '2026-05-28 07:37:31'),
(9, 9, NULL, NULL, '{\"skills\": \"Figma, Adobe XD\"}', 1, '2026-05-28 07:37:31'),
(10, 10, NULL, '/uploads/cvs/cv_10.pdf', NULL, 0, '2026-05-28 07:37:31'),
(11, 11, 'cv1.pdf', '/uploads/cv/11_Bản-in.pdf', 'Extracted text from Bản-in.pdf', 0, '2026-05-28 09:56:20'),
(12, 11, 'cv2.pdf', '/uploads/cv/11_Bản-in.pdf', 'Extracted text from Bản-in.pdf', 0, '2026-05-28 13:40:31'),
(13, 11, 'cv3.pdf', '/uploads/cv/11_Bản-in.pdf', 'Extracted text from Bản-in.pdf', 0, '2026-06-01 12:47:20'),
(14, 11, 'cv4.pdf', '/uploads/cv/11_Bản-in.pdf', 'Extracted text from Bản-in.pdf', 0, '2026-06-01 13:12:27'),
(25, 11, 'CV_Tu_Tao', NULL, '{\"settings\":{\"template\":\"simple\",\"color\":\"#1f2937\",\"font\":\"Roboto\",\"fontSize\":\"medium\"},\"personalInfo\":{\"fullName\":\"Nguyễn Hữu Trọngg\",\"jobTitle\":\"\",\"email\":\"user1@gmail.com\",\"phone\":\"\",\"address\":\"\",\"avatar\":\"\"},\"objective\":\"\",\"experiences\":[],\"educations\":[],\"skills\":[]}', 1, '2026-06-19 07:31:47'),
(26, 11, 'CV_Tu_Tao', NULL, '{\"settings\":{\"template\":\"simple\",\"color\":\"#1f2937\",\"font\":\"Roboto\",\"fontSize\":\"medium\"},\"personalInfo\":{\"fullName\":\"Nguyễn Hữu Trọngg\",\"jobTitle\":\"\",\"email\":\"user1@gmail.com\",\"phone\":\"\",\"address\":\"\",\"avatar\":\"\"},\"objective\":\"\",\"experiences\":[],\"educations\":[],\"skills\":[]}', 1, '2026-06-19 07:33:57'),
(27, 11, 'CV_Tu_Tao', NULL, '{\"settings\":{\"template\":\"simple\",\"color\":\"#1f2937\",\"font\":\"Roboto\",\"fontSize\":\"medium\"},\"personalInfo\":{\"fullName\":\"Nguyễn Hữu Trọngg\",\"jobTitle\":\"\",\"email\":\"user1@gmail.com\",\"phone\":\"\",\"address\":\"\",\"avatar\":\"\"},\"objective\":\"\",\"experiences\":[],\"educations\":[],\"skills\":[]}', 1, '2026-06-19 07:34:49'),
(28, 11, 'CV_Tu_Tao', NULL, '{\"settings\":{\"template\":\"simple\",\"color\":\"#1f2937\",\"font\":\"Roboto\",\"fontSize\":\"medium\"},\"personalInfo\":{\"fullName\":\"Nguyễn Hữu Trọngg\",\"jobTitle\":\"\",\"email\":\"user1@gmail.com\",\"phone\":\"\",\"address\":\"\",\"avatar\":\"\"},\"objective\":\"\",\"experiences\":[],\"educations\":[],\"skills\":[]}', 1, '2026-06-19 07:45:53'),
(29, 11, 'CV_Tu_Tao', NULL, '{\"settings\":{\"template\":\"simple\",\"color\":\"#1f2937\",\"font\":\"Roboto\",\"fontSize\":\"medium\"},\"personalInfo\":{\"fullName\":\"Nguyễn Hữu Trọngg\",\"jobTitle\":\"\",\"email\":\"user1@gmail.com\",\"phone\":\"\",\"address\":\"\",\"avatar\":\"\"},\"objective\":\"\",\"experiences\":[],\"educations\":[],\"skills\":[]}', 1, '2026-06-22 01:23:20');

-- --------------------------------------------------------

--
-- Table structure for table `job_postings`
--

CREATE TABLE `job_postings` (
  `id` bigint NOT NULL,
  `company_id` bigint NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `requirements` text COLLATE utf8mb4_unicode_ci,
  `salary_range` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `work_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING' COMMENT 'PENDING, ACTIVE, CLOSED, REJECTED',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `job_postings`
--

INSERT INTO `job_postings` (`id`, `company_id`, `title`, `description`, `requirements`, `salary_range`, `location`, `work_type`, `status`, `created_at`, `expires_at`) VALUES
(2, 2, 'Marketing Executive', 'Lên kế hoạch và chạy Ads', '1 năm kinh nghiệm', '10 - 15 Triệu', 'TP.HCM', 'FULL_TIME', 'ACTIVE', '2026-05-28 07:37:31', NULL),
(8, 8, 'DevOps / Cloud Engineer', 'Quản lý hạ tầng AWS', 'Có chứng chỉ AWS', '25 - 40 Triệu', 'TP.HCM', 'FULL_TIME', 'CLOSED', '2026-05-28 07:37:31', NULL),
(9, 9, 'Video Editor', 'Dựng video TikTok, Youtube', 'Sử dụng Premiere, AE', '12 - 18 Triệu', 'Hà Nội', 'FULL_TIME', 'ACTIVE', '2026-05-28 07:37:31', NULL),
(11, 11, 'Senior Fullstack Software Engineer', 'Chúng tôi đang tìm kiếm một Senior Fullstack Software Engineer có kinh nghiệm để tham gia vào đội ngũ phát triển sản phẩm công nghệ. Ứng viên sẽ chịu trách nhiệm thiết kế, phát triển và tối ưu hệ thống web quy mô lớn, phối hợp cùng các bộ phận Backend, Frontend, DevOps và QA nhằm xây dựng các giải pháp phần mềm hiện đại, ổn định và có khả năng mở rộng cao. Ngoài ra, ứng viên sẽ tham gia phân tích yêu cầu nghiệp vụ, đề xuất giải pháp kỹ thuật và hỗ trợ đào tạo cho các thành viên junior trong nhóm.', 'Tối thiểu 3 năm kinh nghiệm phát triển phần mềm với JavaScript/TypeScript. Thành thạo ReactJS hoặc NextJS cho Frontend và Node.js hoặc Spring Boot cho Backend. Có kiến thức tốt về RESTful API, Database SQL/NoSQL, Git và quy trình Agile/Scrum. Ưu tiên ứng viên có kinh nghiệm làm việc với Docker, AWS hoặc CI/CD. Có kỹ năng làm việc nhóm, tư duy giải quyết vấn đề và khả năng đọc hiểu tài liệu tiếng Anh.', '25 - 40 Triệu', 'TP.HCM', 'FULL_TIME', 'ACTIVE', '2026-05-28 14:34:02', '2026-06-30 23:59:59'),
(12, 11, 'Backend Java Developer', 'Tham gia phát triển hệ thống backend cho nền tảng tuyển dụng và quản lý doanh nghiệp. Ứng viên sẽ làm việc với kiến trúc microservices, tối ưu hiệu năng hệ thống và xây dựng API phục vụ hàng nghìn người dùng.', 'Tối thiểu 2 năm kinh nghiệm Java Spring Boot, hiểu RESTful API, MySQL, Git và Docker.', '18 - 30 Triệu', 'Hà Nội', 'FULL_TIME', 'ACTIVE', '2026-05-28 14:49:53', '2026-07-01 23:59:59'),
(13, 11, 'Frontend ReactJS Developer', 'Phát triển giao diện web hiện đại, responsive và tối ưu trải nghiệm người dùng cho hệ thống tuyển dụng trực tuyến.', 'Có kinh nghiệm ReactJS, NextJS, TailwindCSS, Redux và làm việc với REST API.', '15 - 25 Triệu', 'TP.HCM', 'FULL_TIME', 'ACTIVE', '2026-05-28 14:49:53', '2026-07-01 23:59:59'),
(14, 11, 'UI/UX Designer', 'Thiết kế giao diện người dùng chuyên nghiệp cho website và ứng dụng di động, phối hợp cùng team phát triển sản phẩm.', 'Sử dụng thành thạo Figma hoặc Adobe XD, có tư duy thiết kế hiện đại.', '12 - 20 Triệu', 'Đà Nẵng', 'FULL_TIME', 'ACTIVE', '2026-05-28 14:49:53', '2026-07-01 23:59:59'),
(15, 11, 'Mobile App Developer Flutter', 'Xây dựng ứng dụng mobile đa nền tảng bằng Flutter, tối ưu hiệu năng và trải nghiệm người dùng.', 'Có kinh nghiệm Flutter, Dart, Firebase và tích hợp API.', '20 - 35 Triệu', 'TP.HCM', 'FULL_TIME', 'ACTIVE', '2026-05-28 14:49:53', '2026-07-01 23:59:59'),
(16, 11, 'AI Engineer', 'Nghiên cứu và phát triển các mô hình trí tuệ nhân tạo phục vụ phân tích dữ liệu và tự động hóa quy trình.', 'Có kiến thức Python, Machine Learning, TensorFlow hoặc PyTorch.', '30 - 50 Triệu', 'Hà Nội', 'FULL_TIME', 'ACTIVE', '2026-05-28 14:49:53', '2026-07-01 23:59:59'),
(17, 11, 'DevOps Engineer', 'Quản lý hạ tầng cloud, triển khai CI/CD và giám sát hệ thống nhằm đảm bảo tính ổn định và bảo mật.', 'Kinh nghiệm AWS, Docker, Kubernetes và Jenkins.', '25 - 40 Triệu', 'TP.HCM', 'FULL_TIME', 'ACTIVE', '2026-05-28 14:49:53', '2026-07-01 23:59:59'),
(18, 11, 'Data Analyst', 'Phân tích dữ liệu kinh doanh, xây dựng dashboard và hỗ trợ ra quyết định chiến lược.', 'Sử dụng SQL, Power BI hoặc Tableau, có kỹ năng phân tích dữ liệu tốt.', '15 - 25 Triệu', 'Hà Nội', 'FULL_TIME', 'ACTIVE', '2026-05-28 14:49:53', '2026-07-01 23:59:59'),
(19, 11, 'Cyber Security Specialist', 'Đảm bảo an toàn thông tin, kiểm tra lỗ hổng bảo mật và giám sát hệ thống mạng doanh nghiệp.', 'Hiểu biết về bảo mật hệ thống, OWASP, Firewall và Pentest.', '25 - 45 Triệu', 'TP.HCM', 'FULL_TIME', 'ACTIVE', '2026-05-28 14:49:53', '2026-07-01 23:59:59'),
(20, 11, 'Business Analyst', 'Phân tích yêu cầu nghiệp vụ, làm việc với khách hàng và đội phát triển để xây dựng giải pháp phù hợp.', 'Có kỹ năng giao tiếp, phân tích hệ thống và viết tài liệu nghiệp vụ.', '18 - 28 Triệu', 'Đà Nẵng', 'FULL_TIME', 'ACTIVE', '2026-05-28 14:49:53', '2026-07-01 23:59:59'),
(21, 11, 'Game Developer Unity', 'Phát triển game 2D/3D trên nền tảng Unity, tối ưu gameplay và hiệu năng sản phẩm.', 'Có kinh nghiệm Unity, C#, tư duy lập trình game tốt.', '20 - 35 Triệu', 'TP.HCM', 'FULL_TIME', 'ACTIVE', '2026-05-28 14:49:53', '2026-07-01 23:59:59'),
(22, 11, 'A', 'A', 'A', 'A', 'A', 'FULL_TIME', 'ACTIVE', '2026-05-28 16:38:14', '2026-06-03 16:38:00'),
(23, 11, 'A', 'A', 'A', 'A', 'A', 'FULL_TIME', 'ACTIVE', '2026-05-28 16:38:47', '2026-07-24 16:38:00'),
(34, 25, 'Frontend Developer (ReactJS)', 'Phát triển giao diện web app', 'Có kinh nghiệm với ReactJS, HTML, CSS', '15 - 20 Triệu', 'Hà Nội', 'FULL_TIME', 'ACTIVE', '2026-05-31 13:50:22', '2026-06-30 23:59:59'),
(35, 25, 'Backend Developer (NodeJS)', 'Xây dựng API cho hệ thống', 'Kinh nghiệm với NodeJS, Express', '18 - 25 Triệu', 'Hà Nội', 'FULL_TIME', 'PENDING', '2026-05-31 13:50:22', '2026-06-30 23:59:59'),
(36, 26, 'Nhân viên QA/QC', 'Kiểm thử chất lượng phần mềm', 'Nắm vững quy trình testing', '12 - 18 Triệu', 'TP.HCM', 'FULL_TIME', 'PENDING', '2026-05-31 13:50:22', NULL),
(37, 26, 'Business Analyst (BA)', 'Phân tích yêu cầu hệ thống', 'Kỹ năng làm tài liệu tốt, hiểu SQL', '20 - 30 Triệu', 'TP.HCM', 'FULL_TIME', 'PENDING', '2026-05-31 13:50:22', NULL),
(38, 22, 'Content Creator', 'Viết bài chuẩn SEO, kịch bản video', 'Sáng tạo, bắt trend tốt', '10 - 15 Triệu', 'Đà Nẵng', 'FULL_TIME', 'PENDING', '2026-05-31 13:50:22', '2026-07-15 23:59:59'),
(39, 22, 'Graphic Designer', 'Thiết kế banner, ấn phẩm truyền thông', 'Thành thạo Photoshop, Illustrator', '12 - 16 Triệu', 'Đà Nẵng', 'FULL_TIME', 'PENDING', '2026-05-31 13:50:22', '2026-07-15 23:59:59'),
(40, 23, 'Chuyên viên Sales Logistics', 'Tìm kiếm khách hàng có nhu cầu XNK', 'Giao tiếp tốt, chịu được áp lực', '10 - 20 Triệu', 'Hải Phòng', 'FULL_TIME', 'PENDING', '2026-05-31 13:50:22', NULL),
(41, 23, 'Nhân viên Chứng từ (Docs)', 'Làm bộ chứng từ xuất nhập khẩu', 'Cẩn thận, tiếng Anh đọc hiểu', '10 - 14 Triệu', 'Hải Phòng', 'FULL_TIME', 'PENDING', '2026-05-31 13:50:22', NULL),
(42, 24, 'Chuyên viên Tuyển dụng', 'Đăng tin, lọc hồ sơ, phỏng vấn', '1 năm kinh nghiệm tuyển dụng IT', '12 - 18 Triệu', 'TP.HCM', 'FULL_TIME', 'PENDING', '2026-05-31 13:50:22', '2026-07-30 23:59:59'),
(43, 24, 'Nhân viên Hành chính', 'Quản lý văn phòng phẩm, chấm công', 'Nhanh nhẹn, thạo tin học văn phòng', '8 - 12 Triệu', 'TP.HCM', 'FULL_TIME', 'PENDING', '2026-05-31 13:50:22', '2026-07-30 23:59:59'),
(44, 11, 'Công việc 1', 'a', 'aa', 'A', 'A', 'FULL_TIME', 'PENDING', '2026-06-01 13:15:13', '2026-07-09 13:15:00');

-- --------------------------------------------------------

--
-- Table structure for table `saved_jobs`
--

CREATE TABLE `saved_jobs` (
  `id` bigint NOT NULL,
  `candidate_id` bigint NOT NULL,
  `job_id` bigint NOT NULL,
  `saved_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `saved_jobs`
--

INSERT INTO `saved_jobs` (`id`, `candidate_id`, `job_id`, `saved_at`) VALUES
(3, 2, 2, '2026-05-28 07:37:31'),
(7, 5, 8, '2026-05-28 07:37:31'),
(9, 9, 9, '2026-05-28 07:37:31');

-- --------------------------------------------------------

--
-- Table structure for table `skills`
--

CREATE TABLE `skills` (
  `id` bigint NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `skills`
--

INSERT INTO `skills` (`id`, `name`) VALUES
(13, 'aaa'),
(10, 'AWS / Docker'),
(15, 'C++'),
(6, 'Digital Marketing'),
(7, 'Figma / UI Design'),
(1, 'Java / Spring Boot'),
(5, 'MySQL / PostgreSQL'),
(4, 'Node.js / Express'),
(8, 'Project Management'),
(3, 'Python / Django'),
(11, 'ReactJS'),
(2, 'ReactJS / VueJS'),
(9, 'SEO / Content'),
(12, 'Spring Boot'),
(14, 'Vite');

-- --------------------------------------------------------

--
-- Table structure for table `system_logs`
--

CREATE TABLE `system_logs` (
  `id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_logs`
--

INSERT INTO `system_logs` (`id`, `user_id`, `action`, `details`, `created_at`) VALUES
(1, 1, 'LOGIN', 'Admin logged into the system', '2026-05-28 07:37:31'),
(2, 1, 'APPROVE_COMPANY', 'Approved company TechVN (ID 1)', '2026-05-28 07:37:31'),
(3, 2, 'CREATE_JOB', 'Employer created new job (ID 1)', '2026-05-28 07:37:31'),
(4, 6, 'UPDATE_PROFILE', 'Candidate 1 updated personal info', '2026-05-28 07:37:31'),
(5, 7, 'UPLOAD_CV', 'Candidate 2 uploaded a new PDF CV', '2026-05-28 07:37:31'),
(6, 3, 'CREATE_JOB', 'Employer created new job (ID 2)', '2026-05-28 07:37:31'),
(7, 8, 'APPLY_JOB', 'Candidate 3 applied for job (ID 3)', '2026-05-28 07:37:31'),
(8, 1, 'REJECT_JOB', 'Admin rejected job (ID 4) due to spam', '2026-05-28 07:37:31'),
(9, 9, 'SAVE_JOB', 'Candidate 4 bookmarked job (ID 4)', '2026-05-28 07:37:31'),
(10, 1, 'BAN_USER', 'Banned account ID 5 for policy violation', '2026-05-28 07:37:31'),
(11, 1, 'APPROVE_COMPANY', 'Company ID: 11', '2026-05-28 14:11:38'),
(12, 1, 'APPROVE_JOB', 'Job ID: 22', '2026-05-28 16:44:44'),
(13, 1, 'APPROVE_JOB', 'Job ID: 23', '2026-05-28 16:44:46'),
(14, 1, 'APPROVE_JOB', 'Job ID: 4', '2026-05-28 16:44:47'),
(15, 1, 'BAN_USER', 'User ID: 22', '2026-05-31 13:29:21'),
(16, 1, 'APPROVE_COMPANY', 'Company ID: 22', '2026-06-01 13:16:07'),
(17, 1, 'APPROVE_JOB', 'Job ID: 34', '2026-06-01 13:16:16');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ADMIN, EMPLOYER, CANDIDATE',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE' COMMENT 'ACTIVE, INACTIVE, BANNED',
  `is_mfa_enabled` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `phone`, `password_hash`, `role`, `status`, `is_mfa_enabled`, `created_at`, `updated_at`) VALUES
(1, 'admin@worklify.com', '0901000001', '$2a$10$Gi2e8f1B8Z2hJ0A3k8e1..5sKx1hQ9h8Z2hJ0A3k8e1..5sKx1hQ', 'ADMIN', 'ACTIVE', 0, '2026-05-28 07:37:31', '2026-05-28 07:37:31'),
(2, 'hr@techvn.vn', '0901000002', '$2a$10$Gi2e8f1B8Z2hJ0A3k8e1..5sKx1hQ9h8Z2hJ0A3k8e1..5sKx1hQ', 'EMPLOYER', 'ACTIVE', 0, '2026-05-28 07:37:31', '2026-05-28 07:37:31'),
(3, 'tuyendung@global.vn', '0901000003', '$2a$10$Gi2e8f1B8Z2hJ0A3k8e1..5sKx1hQ9h8Z2hJ0A3k8e1..5sKx1hQ', 'EMPLOYER', 'ACTIVE', 0, '2026-05-28 07:37:31', '2026-05-28 07:37:31'),
(4, 'contact@fintech.asia', '0901000004', '$2a$10$Gi2e8f1B8Z2hJ0A3k8e1..5sKx1hQ9h8Z2hJ0A3k8e1..5sKx1hQ', 'EMPLOYER', 'ACTIVE', 0, '2026-05-28 07:37:31', '2026-05-28 07:37:31'),
(5, 'jobs@nextgen.com', '0901000005', '$2a$10$Gi2e8f1B8Z2hJ0A3k8e1..5sKx1hQ9h8Z2hJ0A3k8e1..5sKx1hQ', 'EMPLOYER', 'ACTIVE', 0, '2026-05-28 07:37:31', '2026-05-28 07:37:31'),
(6, 'candidate1@gmail.com', '0901000006', '$2a$10$Gi2e8f1B8Z2hJ0A3k8e1..5sKx1hQ9h8Z2hJ0A3k8e1..5sKx1hQ', 'CANDIDATE', 'ACTIVE', 0, '2026-05-28 07:37:31', '2026-05-28 07:37:31'),
(7, 'candidate2@gmail.com', '0901000007', '$2a$10$Gi2e8f1B8Z2hJ0A3k8e1..5sKx1hQ9h8Z2hJ0A3k8e1..5sKx1hQ', 'CANDIDATE', 'ACTIVE', 0, '2026-05-28 07:37:31', '2026-05-28 07:37:31'),
(8, 'candidate3@gmail.com', '0901000008', '$2a$10$Gi2e8f1B8Z2hJ0A3k8e1..5sKx1hQ9h8Z2hJ0A3k8e1..5sKx1hQ', 'CANDIDATE', 'ACTIVE', 0, '2026-05-28 07:37:31', '2026-05-28 07:37:31'),
(9, 'candidate4@gmail.com', '0901000009', '$2a$10$Gi2e8f1B8Z2hJ0A3k8e1..5sKx1hQ9h8Z2hJ0A3k8e1..5sKx1hQ', 'CANDIDATE', 'ACTIVE', 0, '2026-05-28 07:37:31', '2026-05-28 07:37:31'),
(10, 'candidate5@gmail.com', '0901000010', '$2a$10$Gi2e8f1B8Z2hJ0A3k8e1..5sKx1hQ9h8Z2hJ0A3k8e1..5sKx1hQ', 'CANDIDATE', 'ACTIVE', 0, '2026-05-28 07:37:31', '2026-05-28 07:37:31'),
(11, 'user1@gmail.com', NULL, '$2a$10$cHRsGbrhooi8Pv33Auan.ePysKn.wfDIyWSFP9cgnm8hCQ6C91Jk.', 'CANDIDATE', 'ACTIVE', 0, '2026-05-28 09:28:20', '2026-05-28 09:28:20'),
(12, 'ctyA@gmail.com', NULL, '$2a$10$KXp18mkRgnRrS9PHNJAoZejiuSTBiB.olT/NAK7PdDloVjLVITU0y', 'EMPLOYER', 'ACTIVE', 0, '2026-05-28 14:02:35', '2026-05-28 14:02:35'),
(13, 'admin@gmailcom', NULL, '$2a$10$l.ORxdv32LUQsr5KX3P9eeEcnf0QaHMGBS6o0oAKgiT/KFaC/KwdG', 'ADMIN', 'ACTIVE', 0, '2026-05-28 14:08:59', '2026-05-28 14:09:39'),
(20, 'nhatuyendung20@worklify.com', '0902000020', '$2a$10$Gi2e8f1B8Z2hJ0A3k8e1..5sKx1hQ9h8Z2hJ0A3k8e1', 'EMPLOYER', 'ACTIVE', 0, '2026-05-31 12:04:49', '2026-05-31 12:04:49'),
(21, 'nhatuyendung21@worklify.com', '0902000021', '$2a$10$Gi2e8f1B8Z2hJ0A3k8e1..5sKx1hQ9h8Z2hJ0A3k8e1', 'EMPLOYER', 'ACTIVE', 0, '2026-05-31 12:04:49', '2026-05-31 12:04:49'),
(22, 'nhatuyendung22@worklify.com', '0902000022', '$2a$10$Gi2e8f1B8Z2hJ0A3k8e1..5sKx1hQ9h8Z2hJ0A3k8e1', 'EMPLOYER', 'BANNED', 0, '2026-05-31 12:04:49', '2026-05-31 13:29:21'),
(23, 'nhatuyendung23@worklify.com', '0902000023', '$2a$10$Gi2e8f1B8Z2hJ0A3k8e1..5sKx1hQ9h8Z2hJ0A3k8e1', 'EMPLOYER', 'ACTIVE', 0, '2026-05-31 12:04:49', '2026-05-31 12:04:49'),
(24, 'nhatuyendung24@worklify.com', '0902000024', '$2a$10$Gi2e8f1B8Z2hJ0A3k8e1..5sKx1hQ9h8Z2hJ0A3k8e1', 'EMPLOYER', 'ACTIVE', 0, '2026-05-31 12:04:49', '2026-05-31 12:04:49');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_app_candidate` (`candidate_id`),
  ADD KEY `fk_app_job` (`job_id`),
  ADD KEY `fk_app_cv` (`cv_id`);

--
-- Indexes for table `candidate_profiles`
--
ALTER TABLE `candidate_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_candidate_user` (`user_id`);

--
-- Indexes for table `candidate_skills`
--
ALTER TABLE `candidate_skills`
  ADD PRIMARY KEY (`candidate_id`,`skill_id`),
  ADD KEY `fk_cs_skill` (`skill_id`);

--
-- Indexes for table `company_likes`
--
ALTER TABLE `company_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_company` (`user_id`,`company_id`),
  ADD KEY `fk_like_company` (`company_id`);

--
-- Indexes for table `company_profiles`
--
ALTER TABLE `company_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_company_user` (`user_id`);

--
-- Indexes for table `cv_documents`
--
ALTER TABLE `cv_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cv_candidate` (`candidate_id`);

--
-- Indexes for table `job_postings`
--
ALTER TABLE `job_postings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_job_company` (`company_id`);

--
-- Indexes for table `saved_jobs`
--
ALTER TABLE `saved_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_candidate_job` (`candidate_id`,`job_id`),
  ADD KEY `fk_saved_job` (`job_id`);

--
-- Indexes for table `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_log_user` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `candidate_profiles`
--
ALTER TABLE `candidate_profiles`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `company_likes`
--
ALTER TABLE `company_likes`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `company_profiles`
--
ALTER TABLE `company_profiles`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `cv_documents`
--
ALTER TABLE `cv_documents`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `job_postings`
--
ALTER TABLE `job_postings`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `saved_jobs`
--
ALTER TABLE `saved_jobs`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `skills`
--
ALTER TABLE `skills`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `fk_app_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidate_profiles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_app_cv` FOREIGN KEY (`cv_id`) REFERENCES `cv_documents` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_app_job` FOREIGN KEY (`job_id`) REFERENCES `job_postings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `candidate_profiles`
--
ALTER TABLE `candidate_profiles`
  ADD CONSTRAINT `fk_candidate_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `candidate_skills`
--
ALTER TABLE `candidate_skills`
  ADD CONSTRAINT `fk_cs_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidate_profiles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cs_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `company_likes`
--
ALTER TABLE `company_likes`
  ADD CONSTRAINT `fk_like_company` FOREIGN KEY (`company_id`) REFERENCES `company_profiles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_like_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `company_profiles`
--
ALTER TABLE `company_profiles`
  ADD CONSTRAINT `fk_company_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cv_documents`
--
ALTER TABLE `cv_documents`
  ADD CONSTRAINT `fk_cv_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidate_profiles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `job_postings`
--
ALTER TABLE `job_postings`
  ADD CONSTRAINT `fk_job_company` FOREIGN KEY (`company_id`) REFERENCES `company_profiles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `saved_jobs`
--
ALTER TABLE `saved_jobs`
  ADD CONSTRAINT `fk_saved_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidate_profiles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_saved_job` FOREIGN KEY (`job_id`) REFERENCES `job_postings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD CONSTRAINT `fk_log_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
