import { useEffect, useState, useRef } from "react";

import Accordion from "react-bootstrap/Accordion";
import "bootstrap/dist/css/bootstrap.min.css";

/**
 * Reminders Accordion Menu Component - Creates a drop-down style menu that displays the three (3) main submenus of the extension.
 * Uses React Bootstrap to display and format the menu.
 *
 * Features:
 * - Used to mock weekly reminders?
 * 	- Upcoming Assignments
 * 	- Your Events
 *	- UNLV Events
 *
 * Authored by: Billy Estrada
 *
 * Copied from: Jeremy Besitula (Accordian Menu)
 *
 * Put into component WeeklyReminders.jsx by Jeremy Besitula
 * @returns {JSX.Element} The WeeklyReminders component UI.
 */

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function WeeklyReminders() {
  const test = [
    {
      title: "Assignment 1 ",
      description:
        '<h3><strong>Assignment 1: Guidelines and Instructions</strong></h3>\n<p><span>Welcome to&nbsp;</span><strong>Assignment 1</strong><span>! Please read the following guidelines carefully to ensure you complete the assignment successfully.</span></p>\n<p><span style="color: #ba372a;"><strong>Deadline: 02/12/2025</strong></span></p>\n<p><span style="color: #000000;"><strong>Guidelines:</strong></span></p>\n<ol start="1">\n<li>\n<p><strong>Read the Assignment Carefully</strong>:</p>\n<ul>\n<li>\n<p>The assignment consists of multiple questions. Make sure you understand each question before starting.</p>\n</li>\n<li>\n<p>Your answers must match the provided outputs for each question.</p>\n</li>\n</ul>\n</li>\n<li>\n<p><strong>Ask Questions</strong>:</p>\n<ul>\n<li>\n<p>If you have any doubts or need clarification, you can email me or ask questions<span>&nbsp;</span><strong>after Wednesday\'s class</strong>.</p>\n</li>\n</ul>\n</li>\n<li>\n<p><strong>Submission Requirements</strong>:</p>\n<ul>\n<li>\n<p>Submit your completed assignment in Canvas.</p>\n</li>\n<li>\n<p>Ensure your code is well-commented and your outputs match the expected results</p>\n</li>\n<li>Please write the file name as follows: CS469_FirstandLastName_Assignment1.Extension</li>\n<li></li>\n</ul>\n</li>\n</ol>\n<p><strong>Important Note</strong><span>: This assignment is designed to help you learn and practice Python programming for image processing.&nbsp;</span><strong>Please submit your own work!</strong><span> Copying from others or using external sources without understanding will not help you achieve the learning objectives of this course.</span></p>\n<p>&nbsp;</p>\n<p><span>Good luck! If you have any questions, feel free to reach out to<strong> Rawa (our TA)</strong> or me.</span></p>\n<p>&nbsp;</p>\n<p><a class="instructure_file_link inline_disabled" title="CS469_669_DIP_Assignment1.zip" href="https://unlv.instructure.com/courses/177677/files/28355796?verifier=FyTsX8NhNmkBKgt8Ccj0FaedGkODchY2zWTiyQro&amp;wrap=1" target="_blank" data-canvas-previewable="false" data-api-endpoint="https://unlv.instructure.com/api/v1/courses/177677/files/28355796" data-api-returntype="File">CS469_669_DIP_Assignment1.zip</a></p>',
      submission_types: "online_upload",
      workflow_state: "published",
      created_at: "2025-02-05T00:02:33Z",
      updated_at: "2025-03-02T21:39:12Z",
      all_day: true,
      all_day_date: "2025-02-12",
      id: "assignment_2249085",
      type: "assignment",
      assignment: {
        id: 2249085,
        description:
          '<h3><strong>Assignment 1: Guidelines and Instructions</strong></h3>\n<p><span>Welcome to&nbsp;</span><strong>Assignment 1</strong><span>! Please read the following guidelines carefully to ensure you complete the assignment successfully.</span></p>\n<p><span style="color: #ba372a;"><strong>Deadline: 02/12/2025</strong></span></p>\n<p><span style="color: #000000;"><strong>Guidelines:</strong></span></p>\n<ol start="1">\n<li>\n<p><strong>Read the Assignment Carefully</strong>:</p>\n<ul>\n<li>\n<p>The assignment consists of multiple questions. Make sure you understand each question before starting.</p>\n</li>\n<li>\n<p>Your answers must match the provided outputs for each question.</p>\n</li>\n</ul>\n</li>\n<li>\n<p><strong>Ask Questions</strong>:</p>\n<ul>\n<li>\n<p>If you have any doubts or need clarification, you can email me or ask questions<span>&nbsp;</span><strong>after Wednesday\'s class</strong>.</p>\n</li>\n</ul>\n</li>\n<li>\n<p><strong>Submission Requirements</strong>:</p>\n<ul>\n<li>\n<p>Submit your completed assignment in Canvas.</p>\n</li>\n<li>\n<p>Ensure your code is well-commented and your outputs match the expected results</p>\n</li>\n<li>Please write the file name as follows: CS469_FirstandLastName_Assignment1.Extension</li>\n<li></li>\n</ul>\n</li>\n</ol>\n<p><strong>Important Note</strong><span>: This assignment is designed to help you learn and practice Python programming for image processing.&nbsp;</span><strong>Please submit your own work!</strong><span> Copying from others or using external sources without understanding will not help you achieve the learning objectives of this course.</span></p>\n<p>&nbsp;</p>\n<p><span>Good luck! If you have any questions, feel free to reach out to<strong> Rawa (our TA)</strong> or me.</span></p>\n<p>&nbsp;</p>\n<p><a class="instructure_file_link inline_disabled" title="CS469_669_DIP_Assignment1.zip" href="https://unlv.instructure.com/courses/177677/files/28355796?wrap=1" target="_blank" data-canvas-previewable="false" data-api-endpoint="https://unlv.instructure.com/api/v1/courses/177677/files/28355796" data-api-returntype="File">CS469_669_DIP_Assignment1.zip</a></p>',
        due_at: "2025-02-13T07:59:59Z",
        unlock_at: null,
        lock_at: null,
        points_possible: 100,
        grading_type: "points",
        assignment_group_id: 550296,
        grading_standard_id: null,
        created_at: "2025-02-05T00:02:33Z",
        updated_at: "2025-03-02T21:39:12Z",
        peer_reviews: false,
        automatic_peer_reviews: false,
        position: 2,
        grade_group_students_individually: false,
        anonymous_peer_reviews: false,
        group_category_id: null,
        post_to_sis: false,
        moderated_grading: false,
        omit_from_final_grade: false,
        intra_group_peer_reviews: false,
        anonymous_instructor_annotations: false,
        anonymous_grading: false,
        graders_anonymous_to_graders: false,
        grader_count: 0,
        grader_comments_visible_to_graders: true,
        final_grader_id: null,
        grader_names_visible_to_final_grader: true,
        allowed_attempts: -1,
        annotatable_attachment_id: null,
        hide_in_gradebook: false,
        secure_params:
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsdGlfYXNzaWdubWVudF9pZCI6IjhmNTM3MzY3LTU0OTgtNGM0YS05YTU0LTZkZTk5YWQxN2RjNyIsImx0aV9hc3NpZ25tZW50X2Rlc2NyaXB0aW9uIjoiXHUwMDNjaDNcdTAwM2VcdTAwM2NzdHJvbmdcdTAwM2VBc3NpZ25tZW50IDE6IEd1aWRlbGluZXMgYW5kIEluc3RydWN0aW9uc1x1MDAzYy9zdHJvbmdcdTAwM2VcdTAwM2MvaDNcdTAwM2Vcblx1MDAzY3BcdTAwM2VcdTAwM2NzcGFuXHUwMDNlV2VsY29tZSB0b1x1MDAyNm5ic3A7XHUwMDNjL3NwYW5cdTAwM2VcdTAwM2NzdHJvbmdcdTAwM2VBc3NpZ25tZW50IDFcdTAwM2Mvc3Ryb25nXHUwMDNlXHUwMDNjc3Bhblx1MDAzZSEgUGxlYXNlIHJlYWQgdGhlIGZvbGxvd2luZyBndWlkZWxpbmVzIGNhcmVmdWxseSB0byBlbnN1cmUgeW91IGNvbXBsZXRlIHRoZSBhc3NpZ25tZW50IHN1Y2Nlc3NmdWxseS5cdTAwM2Mvc3Bhblx1MDAzZVx1MDAzYy9wXHUwMDNlXG5cdTAwM2NwXHUwMDNlXHUwMDNjc3BhbiBzdHlsZT1cImNvbG9yOiAjYmEzNzJhO1wiXHUwMDNlXHUwMDNjc3Ryb25nXHUwMDNlRGVhZGxpbmU6IDAyLzEyLzIwMjVcdTAwM2Mvc3Ryb25nXHUwMDNlXHUwMDNjL3NwYW5cdTAwM2VcdTAwM2MvcFx1MDAzZVxuXHUwMDNjcFx1MDAzZVx1MDAzY3NwYW4gc3R5bGU9XCJjb2xvcjogIzAwMDAwMDtcIlx1MDAzZVx1MDAzY3N0cm9uZ1x1MDAzZUd1aWRlbGluZXM6XHUwMDNjL3N0cm9uZ1x1MDAzZVx1MDAzYy9zcGFuXHUwMDNlXHUwMDNjL3BcdTAwM2Vcblx1MDAzY29sIHN0YXJ0PVwiMVwiXHUwMDNlXG5cdTAwM2NsaVx1MDAzZVxuXHUwMDNjcFx1MDAzZVx1MDAzY3N0cm9uZ1x1MDAzZVJlYWQgdGhlIEFzc2lnbm1lbnQgQ2FyZWZ1bGx5XHUwMDNjL3N0cm9uZ1x1MDAzZTpcdTAwM2MvcFx1MDAzZVxuXHUwMDNjdWxcdTAwM2Vcblx1MDAzY2xpXHUwMDNlXG5cdTAwM2NwXHUwMDNlVGhlIGFzc2lnbm1lbnQgY29uc2lzdHMgb2YgbXVsdGlwbGUgcXVlc3Rpb25zLiBNYWtlIHN1cmUgeW91IHVuZGVyc3RhbmQgZWFjaCBxdWVzdGlvbiBiZWZvcmUgc3RhcnRpbmcuXHUwMDNjL3BcdTAwM2Vcblx1MDAzYy9saVx1MDAzZVxuXHUwMDNjbGlcdTAwM2Vcblx1MDAzY3BcdTAwM2VZb3VyIGFuc3dlcnMgbXVzdCBtYXRjaCB0aGUgcHJvdmlkZWQgb3V0cHV0cyBmb3IgZWFjaCBxdWVzdGlvbi5cdTAwM2MvcFx1MDAzZVxuXHUwMDNjL2xpXHUwMDNlXG5cdTAwM2MvdWxcdTAwM2Vcblx1MDAzYy9saVx1MDAzZVxuXHUwMDNjbGlcdTAwM2Vcblx1MDAzY3BcdTAwM2VcdTAwM2NzdHJvbmdcdTAwM2VBc2sgUXVlc3Rpb25zXHUwMDNjL3N0cm9uZ1x1MDAzZTpcdTAwM2MvcFx1MDAzZVxuXHUwMDNjdWxcdTAwM2Vcblx1MDAzY2xpXHUwMDNlXG5cdTAwM2NwXHUwMDNlSWYgeW91IGhhdmUgYW55IGRvdWJ0cyBvciBuZWVkIGNsYXJpZmljYXRpb24sIHlvdSBjYW4gZW1haWwgbWUgb3IgYXNrIHF1ZXN0aW9uc1x1MDAzY3NwYW5cdTAwM2VcdTAwMjZuYnNwO1x1MDAzYy9zcGFuXHUwMDNlXHUwMDNjc3Ryb25nXHUwMDNlYWZ0ZXIgV2VkbmVzZGF5J3MgY2xhc3NcdTAwM2Mvc3Ryb25nXHUwMDNlLlx1MDAzYy9wXHUwMDNlXG5cdTAwM2MvbGlcdTAwM2Vcblx1MDAzYy91bFx1MDAzZVxuXHUwMDNjL2xpXHUwMDNlXG5cdTAwM2NsaVx1MDAzZVxuXHUwMDNjcFx1MDAzZVx1MDAzY3N0cm9uZ1x1MDAzZVN1Ym1pc3Npb24gUmVxdWlyZW1lbnRzXHUwMDNjL3N0cm9uZ1x1MDAzZTpcdTAwM2MvcFx1MDAzZVxuXHUwMDNjdWxcdTAwM2Vcblx1MDAzY2xpXHUwMDNlXG5cdTAwM2NwXHUwMDNlU3UuLi4gKHRydW5jYXRlZCkifQ.Lb0wzP7FLajsFfc7DAid5Va5N3tBrvvlosbm9TQIZAI",
        lti_context_id: "8f537367-5498-4c4a-9a54-6de99ad17dc7",
        course_id: 177677,
        name: "Assignment 1 ",
        submission_types: ["online_upload"],
        has_submitted_submissions: true,
        due_date_required: false,
        max_name_length: 255,
        in_closed_grading_period: false,
        graded_submissions_exist: true,
        user_submitted: true,
        is_quiz_assignment: false,
        can_duplicate: true,
        original_course_id: null,
        original_assignment_id: null,
        original_lti_resource_link_id: null,
        original_assignment_name: null,
        original_quiz_id: null,
        workflow_state: "published",
        important_dates: false,
        muted: true,
        html_url:
          "https://unlv.instructure.com/courses/177677/assignments/2249085",
        published: true,
        only_visible_to_overrides: false,
        visible_to_everyone: true,
        locked_for_user: false,
        submissions_download_url:
          "https://unlv.instructure.com/courses/177677/assignments/2249085/submissions?zip=1",
        post_manually: true,
        anonymize_students: false,
        require_lockdown_browser: false,
        restrict_quantitative_data: false,
      },
      html_url:
        "https://unlv.instructure.com/courses/177677/assignments/2249085",
      context_code: "course_177677",
      context_name: "CS469_CS669_1001 - 2025 Sprg",
      context_color: null,
      end_at: "2025-02-13T07:59:59Z",
      start_at: "2025-02-13T07:59:59Z",
      url: "https://unlv.instructure.com/api/v1/calendar_events/assignment_2249085",
      important_dates: false,
    },
    {
      title: "Assignment 2",
      description:
        '<div class="text-cell-section-header layout horizontal center">\n<p><span style="font-size: 18pt;"><strong>Assignment 2: JPEG Image Compression</strong></span></p>\n<p><span style="font-size: 18pt;">In this assignment, you will explore the fundamentals of JPEG image compression by implementing key components of a JPEG compressor from scratch. Please carefully read the full assignment details provided in the Assignment_2.ipynb notebook.</span></p>\n<p><span style="font-size: 18pt;">Due Date: March 25, 2025, by 11:59 PM</span></p>\n</div>\n<p>&nbsp;</p>\n<p><a class="instructure_file_link inline_disabled" title="Assignment_2.ipynb" href="https://unlv.instructure.com/courses/177677/files/28687572?verifier=hZz6z7vyNfnhFn0QidoZE5NBHBd5EwpLMDhw5MEm&amp;wrap=1" target="_blank" data-canvas-previewable="false" data-api-endpoint="https://unlv.instructure.com/api/v1/courses/177677/files/28687572" data-api-returntype="File">Assignment_2.ipynb</a></p>\n<p><a class="instructure_file_link inline_disabled" title="Images.zip" href="https://unlv.instructure.com/courses/177677/files/28687573?verifier=wYorFbugnYi232vFTbnp3v1UoAzjpM0J5uoBrf3v&amp;wrap=1" target="_blank" data-canvas-previewable="false" data-api-endpoint="https://unlv.instructure.com/api/v1/courses/177677/files/28687573" data-api-returntype="File">Images.zip</a></p>',
      submission_types: "online_upload",
      workflow_state: "published",
      created_at: "2025-03-12T17:34:45Z",
      updated_at: "2025-03-12T17:34:45Z",
      all_day: true,
      all_day_date: "2025-03-25",
      id: "assignment_2261276",
      type: "assignment",
      assignment: {
        id: 2261276,
        description:
          '<div class="text-cell-section-header layout horizontal center">\n<p><span style="font-size: 18pt;"><strong>Assignment 2: JPEG Image Compression</strong></span></p>\n<p><span style="font-size: 18pt;">In this assignment, you will explore the fundamentals of JPEG image compression by implementing key components of a JPEG compressor from scratch. Please carefully read the full assignment details provided in the Assignment_2.ipynb notebook.</span></p>\n<p><span style="font-size: 18pt;">Due Date: March 25, 2025, by 11:59 PM</span></p>\n</div>\n<p>&nbsp;</p>\n<p><a class="instructure_file_link inline_disabled" title="Assignment_2.ipynb" href="https://unlv.instructure.com/courses/177677/files/28687572?wrap=1" target="_blank" data-canvas-previewable="false" data-api-endpoint="https://unlv.instructure.com/api/v1/courses/177677/files/28687572" data-api-returntype="File">Assignment_2.ipynb</a></p>\n<p><a class="instructure_file_link inline_disabled" title="Images.zip" href="https://unlv.instructure.com/courses/177677/files/28687573?wrap=1" target="_blank" data-canvas-previewable="false" data-api-endpoint="https://unlv.instructure.com/api/v1/courses/177677/files/28687573" data-api-returntype="File">Images.zip</a></p>',
        due_at: "2025-03-26T06:59:59Z",
        unlock_at: null,
        lock_at: null,
        points_possible: 100,
        grading_type: "points",
        assignment_group_id: 550296,
        grading_standard_id: null,
        created_at: "2025-03-12T17:34:45Z",
        updated_at: "2025-03-12T17:34:45Z",
        peer_reviews: false,
        automatic_peer_reviews: false,
        position: 4,
        grade_group_students_individually: false,
        anonymous_peer_reviews: false,
        group_category_id: null,
        post_to_sis: false,
        moderated_grading: false,
        omit_from_final_grade: false,
        intra_group_peer_reviews: false,
        anonymous_instructor_annotations: false,
        anonymous_grading: false,
        graders_anonymous_to_graders: false,
        grader_count: 0,
        grader_comments_visible_to_graders: true,
        final_grader_id: null,
        grader_names_visible_to_final_grader: true,
        allowed_attempts: -1,
        annotatable_attachment_id: null,
        hide_in_gradebook: false,
        secure_params:
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsdGlfYXNzaWdubWVudF9pZCI6ImY5ODRkZjhlLTg4ZmEtNDQwMi1hZDE4LWE3NjE1NzY2M2YwYiIsImx0aV9hc3NpZ25tZW50X2Rlc2NyaXB0aW9uIjoiXHUwMDNjZGl2IGNsYXNzPVwidGV4dC1jZWxsLXNlY3Rpb24taGVhZGVyIGxheW91dCBob3Jpem9udGFsIGNlbnRlclwiXHUwMDNlXG5cdTAwM2NwXHUwMDNlXHUwMDNjc3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMThwdDtcIlx1MDAzZVx1MDAzY3N0cm9uZ1x1MDAzZUFzc2lnbm1lbnQgMjogSlBFRyBJbWFnZSBDb21wcmVzc2lvblx1MDAzYy9zdHJvbmdcdTAwM2VcdTAwM2Mvc3Bhblx1MDAzZVx1MDAzYy9wXHUwMDNlXG5cdTAwM2NwXHUwMDNlXHUwMDNjc3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMThwdDtcIlx1MDAzZUluIHRoaXMgYXNzaWdubWVudCwgeW91IHdpbGwgZXhwbG9yZSB0aGUgZnVuZGFtZW50YWxzIG9mIEpQRUcgaW1hZ2UgY29tcHJlc3Npb24gYnkgaW1wbGVtZW50aW5nIGtleSBjb21wb25lbnRzIG9mIGEgSlBFRyBjb21wcmVzc29yIGZyb20gc2NyYXRjaC4gUGxlYXNlIGNhcmVmdWxseSByZWFkIHRoZSBmdWxsIGFzc2lnbm1lbnQgZGV0YWlscyBwcm92aWRlZCBpbiB0aGUgQXNzaWdubWVudF8yLmlweW5iIG5vdGVib29rLlx1MDAzYy9zcGFuXHUwMDNlXHUwMDNjL3BcdTAwM2Vcblx1MDAzY3BcdTAwM2VcdTAwM2NzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAxOHB0O1wiXHUwMDNlRHVlIERhdGU6IE1hcmNoIDI1LCAyMDI1LCBieSAxMTo1OSBQTVx1MDAzYy9zcGFuXHUwMDNlXHUwMDNjL3BcdTAwM2Vcblx1MDAzYy9kaXZcdTAwM2Vcblx1MDAzY3BcdTAwM2VcdTAwMjZuYnNwO1x1MDAzYy9wXHUwMDNlXG5cdTAwM2NwXHUwMDNlXHUwMDNjYSBjbGFzcz1cImluc3RydWN0dXJlX2ZpbGVfbGluayBpbmxpbmVfZGlzYWJsZWRcIiB0aXRsZT1cIkFzc2lnbm1lbnRfMi5pcHluYlwiIGhyZWY9XCIvY291cnNlcy8xNzc2NzcvZmlsZXMvMjg2ODc1NzI_d3JhcD0xXCIgdGFyZ2V0PVwiX2JsYW5rXCIgZGF0YS1jYW52YXMtcHJldmlld2FibGU9XCJmYWxzZVwiXHUwMDNlQXNzaWdubWVudF8yLmlweW5iXHUwMDNjL2FcdTAwM2VcdTAwM2MvcFx1MDAzZVxuXHUwMDNjcFx1MDAzZVx1MDAzY2EgY2xhc3M9XCJpbnN0cnVjdHVyZV9maWxlX2xpbmsgaW5saW5lX2Rpc2FibGVkXCIgdGl0bGU9XCJJbWFnZXMuemlwXCIgaHJlZj1cIi9jb3Vyc2VzLzE3NzY3Ny9maWxlcy8yODY4NzU3Mz93cmFwPTFcIiB0YXJnZXQ9XCJfYmxhbmtcIiBkYXRhLWNhbnZhcy1wcmV2aWV3YWJsZT1cImZhbHNlXCJcdTAwM2VJbWFnZXMuemlwXHUwMDNjL2FcdTAwM2VcdTAwM2MvcFx1MDAzZSJ9.Im5irtLZhTlHqcalEiD94JlaueKoFOQDTlsyGTpE0xI",
        lti_context_id: "f984df8e-88fa-4402-ad18-a76157663f0b",
        course_id: 177677,
        name: "Assignment 2",
        submission_types: ["online_upload"],
        has_submitted_submissions: true,
        due_date_required: false,
        max_name_length: 255,
        in_closed_grading_period: false,
        graded_submissions_exist: false,
        user_submitted: false,
        is_quiz_assignment: false,
        can_duplicate: true,
        original_course_id: null,
        original_assignment_id: null,
        original_lti_resource_link_id: null,
        original_assignment_name: null,
        original_quiz_id: null,
        workflow_state: "published",
        important_dates: false,
        muted: true,
        html_url:
          "https://unlv.instructure.com/courses/177677/assignments/2261276",
        published: true,
        only_visible_to_overrides: false,
        visible_to_everyone: true,
        locked_for_user: false,
        submissions_download_url:
          "https://unlv.instructure.com/courses/177677/assignments/2261276/submissions?zip=1",
        post_manually: true,
        anonymize_students: false,
        require_lockdown_browser: false,
        restrict_quantitative_data: false,
      },
      html_url:
        "https://unlv.instructure.com/courses/177677/assignments/2261276",
      context_code: "course_177677",
      context_name: "CS469_CS669_1001 - 2025 Sprg",
      context_color: null,
      end_at: "2025-03-26T06:59:59Z",
      start_at: "2025-03-26T06:59:59Z",
      url: "https://unlv.instructure.com/api/v1/calendar_events/assignment_2261276",
      important_dates: false,
    },
    {
      title: "Roll Call Attendance",
      description: null,
      submission_types: "external_tool",
      workflow_state: "published",
      created_at: "2025-01-28T02:42:34Z",
      updated_at: "2025-02-25T17:26:17Z",
      all_day: false,
      all_day_date: null,
      id: "assignment_2244803",
      type: "assignment",
      assignment: {
        id: 2244803,
        description: null,
        due_at: null,
        unlock_at: null,
        lock_at: null,
        points_possible: 100,
        grading_type: "percent",
        assignment_group_id: 550296,
        grading_standard_id: null,
        created_at: "2025-01-28T02:42:34Z",
        updated_at: "2025-02-25T17:26:17Z",
        peer_reviews: false,
        automatic_peer_reviews: false,
        position: 1,
        grade_group_students_individually: false,
        anonymous_peer_reviews: false,
        group_category_id: null,
        post_to_sis: false,
        moderated_grading: false,
        omit_from_final_grade: false,
        intra_group_peer_reviews: false,
        anonymous_instructor_annotations: false,
        anonymous_grading: false,
        graders_anonymous_to_graders: false,
        grader_count: 0,
        grader_comments_visible_to_graders: true,
        final_grader_id: null,
        grader_names_visible_to_final_grader: true,
        allowed_attempts: -1,
        annotatable_attachment_id: null,
        hide_in_gradebook: false,
        secure_params:
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsdGlfYXNzaWdubWVudF9pZCI6IjA5MWRlZjE4LTQ4NDYtNGEwYi04MWU3LTQxYzdlOTQzNDIzNyJ9.-f_SdoJvz4V4WFN1c5QuJOZkQgve6XQYLTt0pJvy_e4",
        lti_context_id: "091def18-4846-4a0b-81e7-41c7e9434237",
        course_id: 177677,
        name: "Roll Call Attendance",
        submission_types: ["external_tool"],
        has_submitted_submissions: true,
        due_date_required: false,
        max_name_length: 255,
        in_closed_grading_period: false,
        graded_submissions_exist: true,
        user_submitted: true,
        is_quiz_assignment: false,
        can_duplicate: false,
        original_course_id: null,
        original_assignment_id: null,
        original_lti_resource_link_id: null,
        original_assignment_name: null,
        original_quiz_id: null,
        workflow_state: "published",
        important_dates: false,
        external_tool_tag_attributes: {
          url: "https://rollcall.instructure.com/launch",
          new_tab: false,
          external_data: null,
          resource_link_id: "b8505562acd9aa652b91a0f6b22f38394b0176f4",
          resource_link_title: null,
          content_type: "ContextExternalTool",
          content_id: 45,
          custom_params: null,
        },
        muted: true,
        html_url:
          "https://unlv.instructure.com/courses/177677/assignments/2244803",
        url: null,
        published: true,
        only_visible_to_overrides: false,
        visible_to_everyone: true,
        locked_for_user: false,
        submissions_download_url:
          "https://unlv.instructure.com/courses/177677/assignments/2244803/submissions?zip=1",
        post_manually: true,
        anonymize_students: false,
        require_lockdown_browser: false,
        restrict_quantitative_data: false,
      },
      html_url:
        "https://unlv.instructure.com/courses/177677/assignments/2244803",
      context_code: "course_177677",
      context_name: "CS469_CS669_1001 - 2025 Sprg",
      context_color: null,
      end_at: null,
      start_at: null,
      url: "https://unlv.instructure.com/api/v1/calendar_events/assignment_2244803",
      important_dates: false,
    },
    {
      title: "Quiz 1",
      description:
        "<p><span>This quiz is closed-notes and does not allow internet access. You will have a total of 15 minutes to complete 8 questions in class. Please note that this quiz is a single attempt and consists of multiple-choice, true/false, and fill-in-the-blank questions.</span></p>",
      submission_types: "online_quiz",
      workflow_state: "published",
      created_at: "2025-02-13T00:16:14Z",
      updated_at: "2025-02-25T17:26:17Z",
      all_day: false,
      all_day_date: null,
      lock_info: {
        lock_at: "2025-02-13T02:30:00Z",
        can_view: true,
        asset_string: "assignment_2252223",
      },
      id: "assignment_2252223",
      type: "assignment",
      assignment: {
        id: 2252223,
        description:
          "<p><span>This quiz is closed-notes and does not allow internet access. You will have a total of 15 minutes to complete 8 questions in class. Please note that this quiz is a single attempt and consists of multiple-choice, true/false, and fill-in-the-blank questions.</span></p>",
        due_at: null,
        unlock_at: "2025-02-13T01:30:00Z",
        lock_at: "2025-02-13T02:30:00Z",
        points_possible: 10,
        grading_type: "points",
        assignment_group_id: 550296,
        grading_standard_id: null,
        created_at: "2025-02-13T00:16:14Z",
        updated_at: "2025-02-25T17:26:17Z",
        peer_reviews: false,
        automatic_peer_reviews: false,
        position: 3,
        grade_group_students_individually: false,
        anonymous_peer_reviews: false,
        group_category_id: null,
        post_to_sis: false,
        moderated_grading: false,
        omit_from_final_grade: false,
        intra_group_peer_reviews: false,
        anonymous_instructor_annotations: false,
        anonymous_grading: false,
        graders_anonymous_to_graders: false,
        grader_count: 0,
        grader_comments_visible_to_graders: true,
        final_grader_id: null,
        grader_names_visible_to_final_grader: true,
        allowed_attempts: -1,
        annotatable_attachment_id: null,
        hide_in_gradebook: false,
        lock_info: {
          lock_at: "2025-02-13T02:30:00Z",
          can_view: true,
          asset_string: "assignment_2252223",
        },
        secure_params:
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsdGlfYXNzaWdubWVudF9pZCI6ImU4ZjExYjkyLWU4ODEtNGRlOC1hZDFjLTI2ZTQ2NGVjZjViYyIsImx0aV9hc3NpZ25tZW50X2Rlc2NyaXB0aW9uIjoiXHUwMDNjcFx1MDAzZVx1MDAzY3NwYW5cdTAwM2VUaGlzIHF1aXogaXMgY2xvc2VkLW5vdGVzIGFuZCBkb2VzIG5vdCBhbGxvdyBpbnRlcm5ldCBhY2Nlc3MuIFlvdSB3aWxsIGhhdmUgYSB0b3RhbCBvZiAxNSBtaW51dGVzIHRvIGNvbXBsZXRlIDggcXVlc3Rpb25zIGluIGNsYXNzLiBQbGVhc2Ugbm90ZSB0aGF0IHRoaXMgcXVpeiBpcyBhIHNpbmdsZSBhdHRlbXB0IGFuZCBjb25zaXN0cyBvZiBtdWx0aXBsZS1jaG9pY2UsIHRydWUvZmFsc2UsIGFuZCBmaWxsLWluLXRoZS1ibGFuayBxdWVzdGlvbnMuXHUwMDNjL3NwYW5cdTAwM2VcdTAwM2MvcFx1MDAzZSJ9.cAwGt18jNG9Y5SjTxlKrDZL4KwsYn9dz2fl_XFbXxDY",
        lti_context_id: "e8f11b92-e881-4de8-ad1c-26e464ecf5bc",
        course_id: 177677,
        name: "Quiz 1",
        submission_types: ["online_quiz"],
        has_submitted_submissions: true,
        due_date_required: false,
        max_name_length: 255,
        in_closed_grading_period: false,
        graded_submissions_exist: true,
        user_submitted: true,
        is_quiz_assignment: true,
        can_duplicate: false,
        original_course_id: null,
        original_assignment_id: null,
        original_lti_resource_link_id: null,
        original_assignment_name: null,
        original_quiz_id: null,
        workflow_state: "published",
        important_dates: false,
        muted: true,
        html_url:
          "https://unlv.instructure.com/courses/177677/assignments/2252223",
        quiz_id: 674151,
        anonymous_submissions: false,
        published: true,
        only_visible_to_overrides: false,
        visible_to_everyone: true,
        locked_for_user: true,
        lock_explanation: "This assignment was locked Feb 12 at 6:30pm.",
        submissions_download_url:
          "https://unlv.instructure.com/courses/177677/quizzes/674151/submissions?zip=1",
        post_manually: true,
        anonymize_students: false,
        require_lockdown_browser: false,
        restrict_quantitative_data: false,
      },
      html_url:
        "https://unlv.instructure.com/courses/177677/assignments/2252223",
      context_code: "course_177677",
      context_name: "CS469_CS669_1001 - 2025 Sprg",
      context_color: null,
      end_at: null,
      start_at: null,
      url: "https://unlv.instructure.com/api/v1/calendar_events/assignment_2252223",
      important_dates: false,
    },
  ];

  const [groupedAssignments, setGroupedAssignments] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });

  useEffect(() => {
    chrome.runtime.sendMessage(
      {
        action: "get_weekly_assignments",
        assignments: test,
      },
      (grouped) => {
        if (chrome.runtime.lastError) {
          console.error("Message error:", chrome.runtime.lastError.message);
        } else {
          setGroupedAssignments(grouped);
        }
      }
    );
  }, []);

  return (
    <Accordion defaultActiveKey="0">
      {daysOfWeek.map((day, index) => (
        <Accordion.Item eventKey={index.toString()} key={day}>
          <Accordion.Header>{day}</Accordion.Header>
          <Accordion.Body>
            {groupedAssignments[day] && groupedAssignments[day].length > 0 ? (
              <ul>
                {groupedAssignments[day].map((assignment, idx) => (
                  <li key={idx}>{assignment.name}</li>
                ))}
              </ul>
            ) : (
              <p>No assignments</p>
            )}
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

export default WeeklyReminders;
