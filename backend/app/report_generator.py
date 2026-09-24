import os
import io
import time
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        footer_text = f"AquaGuard AI – Marine Debris & Environmental Intelligence Audit | Page {self._pageNumber} of {page_count}"
        self.drawString(36, 22, footer_text)
        self.drawRightString(576, 22, "Smart India Hackathon Prototype • AI-Assisted Assessment")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(36, 32, 576, 32)
        self.restoreState()

def generate_pdf_report(session_data: Dict[str, Any]) -> io.BytesIO:
    """Generates a comprehensive 13-section environmental audit PDF report."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=42
    )

    styles = getSampleStyleSheet()

    # Custom typography
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor('#0a2540')
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#008080')
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#0a2540'),
        spaceBefore=7,
        spaceAfter=3
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#1e293b')
    )

    bold_body = ParagraphStyle(
        'BoldBody',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    story = []

    # Title & Banner
    story.append(Paragraph("AQUAGUARD AI – UNDERWATER MARINE DEBRIS SURVEY", title_style))
    story.append(Paragraph("AI-Powered Underwater Sensing, Multi-Evidence Verification & Cleanup Intelligence Platform", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#008080'), spaceBefore=2, spaceAfter=6))

    # SECTION 1: Executive Summary & Remediation Recommendation
    story.append(Paragraph("1. Executive Summary & Remediation Recommendation", section_heading))
    action_rec = session_data.get("action_recommendation", {})
    act_title = action_rec.get("title", "Remediation Assessment")
    act_summary = action_rec.get("action_summary", "Review verified targets and deploy appropriate cleanup equipment.")
    act_gear = ", ".join(action_rec.get("required_equipment", ["Standard Diver Mesh Sacks"]))
    act_time = action_rec.get("timeframe", "Within 48 hours")

    exec_html = f"""
    <b>Operational Priority:</b> {action_rec.get('priority_badge', 'PRIORITY 1')} &nbsp;|&nbsp; <b>Action Objective:</b> {act_title}<br/>
    <b>Remediation Protocol:</b> {act_summary}<br/>
    <b>Recommended Tools:</b> {act_gear} &nbsp;|&nbsp; <b>Execution Window:</b> {act_time}
    """
    exec_box = Table([[Paragraph(exec_html, body_style)]], colWidths=[540])
    exec_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0fdfa')),
        ('BOX', (0, 0), (-1, -1), 1.0, colors.HexColor('#0d9488')),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(exec_box)
    story.append(Spacer(1, 4))

    # SECTION 2: Survey Metadata & Sensing Modality
    story.append(Paragraph("2. Survey Metadata & Sensing Modality", section_heading))
    raw_ts = session_data.get("timestamp", time.time())
    if isinstance(raw_ts, (int, float)):
        date_str = time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime(raw_ts))
    else:
        date_str = str(raw_ts)
    modality = session_data.get("modality", "OPTICAL")
    detector_name = session_data.get("detector_type", "AquaGuard Precision Pipeline")
    gps_info = session_data.get("gps_info", {})
    gps_str = f"Lat: {gps_info.get('latitude', 'N/A')}, Lon: {gps_info.get('longitude', 'N/A')}" if gps_info.get("has_gps") else "Relative Survey Grid (EXIF GPS Unset)"

    meta_data = [
        [
            Paragraph(f"<b>Session ID:</b> {session_data.get('session_id', 'N/A')}", body_style),
            Paragraph(f"<b>Survey Date:</b> {date_str}", body_style)
        ],
        [
            Paragraph(f"<b>Survey Location:</b> {session_data.get('location', 'Marine Station Alpha')}", body_style),
            Paragraph(f"<b>Survey Depth Layer:</b> {session_data.get('depth_meters', 12.0)} meters", body_style)
        ],
        [
            Paragraph(f"<b>Sensing Modality:</b> {modality}", body_style),
            Paragraph(f"<b>Spatial Positioning:</b> {gps_str}", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[270, 270])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('PADDING', (0, 0), (-1, -1), 3.5),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 4))

    # SECTION 3: Input Quality & Pre-Processing Gate Assessment
    story.append(Paragraph("3. Input Quality & Pre-Processing Gate Assessment", section_heading))
    quality = session_data.get("quality", {})
    q_score = quality.get("overall_score", 82)
    q_vis = quality.get("visibility", "Good")
    q_haze = quality.get("haze", "Low")
    q_readiness = quality.get("readiness", "READY")
    pipe_applied = session_data.get("pipeline_applied", "Adaptive LAB CLAHE")

    q_data = [
        [
            Paragraph(f"<b>Optical Quality Score:</b> {q_score}/100", body_style),
            Paragraph(f"<b>Visibility Index:</b> {q_vis}", body_style),
            Paragraph(f"<b>Turbidity:</b> {q_haze}", body_style),
            Paragraph(f"<b>Gate Status:</b> <font color='#0d9488'><b>{q_readiness}</b></font>", body_style)
        ]
    ]
    q_table = Table(q_data, colWidths=[135, 135, 135, 135])
    q_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f1f5f9')),
        ('PADDING', (0, 0), (-1, -1), 3.5),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ]))
    story.append(q_table)
    story.append(Paragraph(f"<i>Applied Enhancement: {pipe_applied}</i>", body_style))
    story.append(Spacer(1, 4))

    # SECTION 4: Confirmed Marine Debris Targets (Stable TGT-001 IDs)
    story.append(Paragraph("4. Confirmed Marine Debris Targets (Verified)", section_heading))
    detections = session_data.get("detections", [])
    headers = [
        Paragraph("<b>Target ID</b>", bold_body),
        Paragraph("<b>Category</b>", bold_body),
        Paragraph("<b>Detect Conf.</b>", bold_body),
        Paragraph("<b>Verify Score</b>", bold_body),
        Paragraph("<b>AI Est. Depth</b>", bold_body),
        Paragraph("<b>Cleanup Tool</b>", bold_body)
    ]
    det_rows = [headers]
    for d in detections:
        det_conf_pct = d.get("detection_confidence_pct", f"{round(d.get('detection_confidence', 0.9)*100, 1)}%")
        ver_score = f"{d.get('verification_score', 92.0)}/100"
        tool = d.get("cleanup_tool", "Mesh Sack")
        row = [
            Paragraph(f"<b>{d.get('id', 'TGT-001')}</b>", body_style),
            Paragraph(d.get("category", "Debris"), body_style),
            Paragraph(det_conf_pct, body_style),
            Paragraph(ver_score, body_style),
            Paragraph(f"{d.get('estimated_depth_m', 2.0)}m", body_style),
            Paragraph(tool, body_style)
        ]
        det_rows.append(row)

    if len(det_rows) == 1:
        det_rows.append([Paragraph("No confirmed debris targets above precision threshold.", body_style)] * 6)

    det_table = Table(det_rows, colWidths=[65, 115, 75, 75, 70, 140])
    det_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f766e')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0, 0), (-1, -1), 3),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#ffffff'), colors.HexColor('#f8fafc')]),
    ]))
    for col in range(len(headers)):
        headers[col].style.textColor = colors.white
    story.append(det_table)
    story.append(Spacer(1, 4))

    # SECTION 5: Rejected & In-Review Candidates Summary
    val_sum = session_data.get("validation_summary", {})
    story.append(Paragraph("5. Rejected & In-Review Candidates Summary", section_heading))
    fp_text = f"""
    <b>Total Candidates Evaluated:</b> {val_sum.get('total_candidates_generated', len(detections))} &nbsp;|&nbsp;
    <b>Confirmed:</b> {val_sum.get('confirmed_count', len(detections))} &nbsp;|&nbsp;
    <b>Review Required:</b> {val_sum.get('review_count', 0)} &nbsp;|&nbsp;
    <b>Safely Rejected:</b> {val_sum.get('rejected_count', 0)}<br/>
    <i>Rejection Verification Criteria: Frame border touches, insufficient annular local contrast delta, non-conforming aspect ratio, lack of acoustic shadow support.</i>
    """
    fp_box = Table([[Paragraph(fp_text, body_style)]], colWidths=[540])
    fp_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(fp_box)
    story.append(Spacer(1, 4))

    # SECTION 6: Multi-Factor Environmental Risk Assessment
    story.append(Paragraph("6. Multi-Factor Environmental Risk Assessment", section_heading))
    risk_info = session_data.get("environmental_risk", {})
    risk_summary = risk_info.get("summary", "Low baseline environmental disruption.")
    story.append(Paragraph(f"<b>Ecological Impact Rating:</b> <font color='#dc2626'><b>{session_data.get('severity', 'LOW')} (Score: {risk_info.get('risk_score', 3)}/10)</b></font><br/>{risk_summary}", body_style))
    story.append(Spacer(1, 4))

    # SECTION 7: DBSCAN Spatial Hotspot Analysis
    story.append(Paragraph("7. DBSCAN Spatial Hotspot Analysis", section_heading))
    hotspots = session_data.get("hotspots", [])
    hs_rows = [[
        Paragraph("<b>Hotspot Cluster</b>", bold_body),
        Paragraph("<b>Target Count</b>", bold_body),
        Paragraph("<b>Dominant Category</b>", bold_body),
        Paragraph("<b>Cluster Risk</b>", bold_body),
        Paragraph("<b>Recommended Action</b>", bold_body)
    ]]
    for hs in hotspots:
        hs_rows.append([
            Paragraph(hs.get("name", "Hotspot Alpha"), body_style),
            Paragraph(str(hs.get("target_count", 1)), body_style),
            Paragraph(hs.get("dominant_category", "Debris"), body_style),
            Paragraph(hs.get("risk_level", "HIGH"), body_style),
            Paragraph(hs.get("recommended_action", "Routine monitoring."), body_style)
        ])
    if len(hs_rows) == 1:
        hs_rows.append([Paragraph("No dense debris clusters identified in surveyed transect.", body_style)] * 5)

    hs_table = Table(hs_rows, colWidths=[110, 65, 95, 70, 200])
    hs_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#334155')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0, 0), (-1, -1), 3),
    ]))
    for col in range(len(hs_rows[0])):
        hs_rows[0][col].style.textColor = colors.white
    story.append(hs_table)
    story.append(Spacer(1, 4))

    # SECTION 8: Ranked Cleanup Priority Protocol
    story.append(Paragraph("8. Ranked Cleanup Priority Protocol", section_heading))
    priorities = session_data.get("cleanup_priorities", [])
    p_rows = [[
        Paragraph("<b>Rank</b>", bold_body),
        Paragraph("<b>Sector Zone</b>", bold_body),
        Paragraph("<b>Priority Level</b>", bold_body),
        Paragraph("<b>Intervention Protocol</b>", bold_body)
    ]]
    for p in priorities:
        p_rows.append([
            Paragraph(f"Priority {p.get('rank', 1)}", body_style),
            Paragraph(p.get("zone", "Sector"), body_style),
            Paragraph(p.get("priority_level", "MEDIUM"), body_style),
            Paragraph(p.get("action", "Routine monitoring."), body_style)
        ])
    p_table = Table(p_rows, colWidths=[65, 125, 80, 270])
    p_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f766e')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0, 0), (-1, -1), 3),
    ]))
    for col in range(len(p_rows[0])):
        p_rows[0][col].style.textColor = colors.white
    story.append(p_table)
    story.append(Spacer(1, 4))

    # SECTION 9: Autonomous Inspection Route & Battery Planning
    story.append(Paragraph("9. Autonomous Inspection Route & Battery Planning", section_heading))
    insp = session_data.get("inspection_plan", {})
    route_text = f"""
    <b>Mission Status:</b> {insp.get('mission_status', 'PLANNED')} &nbsp;|&nbsp;
    <b>Total Transit Distance:</b> {insp.get('total_distance_m', 0.0)} meters &nbsp;|&nbsp;
    <b>Estimated Duration:</b> {insp.get('estimated_duration_min', 0.0)} minutes &nbsp;|&nbsp;
    <b>Battery Budget:</b> {insp.get('battery_consumption_pct', '12.5%')}<br/>
    <i>Waypoints Sequence: {' → '.join([wp.get('target_id', 'TGT') for wp in insp.get('waypoints', [])])}</i>
    """
    insp_box = Table([[Paragraph(route_text, body_style)]], colWidths=[540])
    insp_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(insp_box)
    story.append(Spacer(1, 4))

    # SECTION 10: Target Evidence & AI Optical/Acoustic Reasoning
    story.append(Paragraph("10. Target Evidence & AI Optical/Acoustic Reasoning", section_heading))
    ev_lines = []
    for d in detections[:3]:
        ev_lines.append(f"• <b>{d.get('id', 'TGT')}: {d.get('category')}</b> — {d.get('ai_explanation')}")
    if not ev_lines:
        ev_lines.append("No active target evidence logged.")
    story.append(Paragraph("<br/>".join(ev_lines), body_style))
    story.append(Spacer(1, 4))

    # SECTION 11: 2D Coordinate Sector Map
    story.append(Paragraph("11. 2D Coordinate Sector & Spatial Distribution", section_heading))
    zones = session_data.get("density_zones", {})
    zone_str = " | ".join([f"<b>{k.split(' ')[0]}:</b> {v.get('count', 0)} items ({v.get('density', 'NONE')})" for k, v in zones.items()])
    story.append(Paragraph(f"<b>Spatial Quadrants:</b> {zone_str}", body_style))
    story.append(Spacer(1, 4))

    # SECTION 12: Technical Methodology & Model Disclosures
    story.append(Paragraph("12. Technical Methodology & Model Disclosures", section_heading))
    tech_text = f"""
    <b>Inference Engine:</b> {detector_name} &nbsp;|&nbsp; <b>Live Latency:</b> {session_data.get('processing_time_ms', 42.0)} ms<br/>
    <b>Depth Calibration:</b> Depth readings represent AI-estimated visual perspective layers. Operational ROV deployment requires cross-referencing onboard acoustic altimeters.
    """
    tech_box = Table([[Paragraph(tech_text, body_style)]], colWidths=[540])
    tech_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(tech_box)
    story.append(Spacer(1, 4))

    # SECTION 13: Limitations & Environmental Compliance Sign-Off
    story.append(Paragraph("13. Limitations & Environmental Compliance Sign-Off", section_heading))
    sign_text = """
    <b>Disclaimer:</b> AquaGuard AI is a decision-support prototype for Smart India Hackathon. It does not replace certified marine salvage inspection divers. All detections are subject to multi-evidence verification.<br/>
    <b>Compliance Status:</b> ISO-Aligned Marine Ecosystem Assessment • <b>Authorized By:</b> AquaGuard AI System
    """
    sign_box = Table([[Paragraph(sign_text, body_style)]], colWidths=[540])
    sign_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0fdfa')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#0d9488')),
        ('PADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(sign_box)

    doc.build(story, canvasmaker=NumberedCanvas)
    buffer.seek(0)
    return buffer

def generate_environmental_report(session_data: Dict[str, Any]) -> bytes:
    """Convenience function returning raw PDF bytes."""
    buf = generate_pdf_report(session_data)
    return buf.getvalue()

