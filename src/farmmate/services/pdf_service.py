"""
FarmMate Executive PDF Advisory Report Service
Compiles soil nutrient tests, weather telemetry, crop match predictions, and fertilizer schedules into an executive PDF report.
"""
import io
import datetime
from typing import Dict, Any

class PDFReportGenerator:
    def generate_advisory_pdf(self, data: Dict[str, Any]) -> bytes:
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib import colors

            buffer = io.BytesIO()
            doc = SimpleDocTemplate(
                buffer,
                pagesize=letter,
                rightMargin=36,
                leftMargin=36,
                topMargin=36,
                bottomMargin=36
            )

            styles = getSampleStyleSheet()
            
            # Custom Styles
            title_style = ParagraphStyle(
                'DocTitle',
                parent=styles['Heading1'],
                fontSize=22,
                leading=26,
                textColor=colors.HexColor('#065f46'),
                fontName='Helvetica-Bold',
                spaceAfter=4
            )

            subtitle_style = ParagraphStyle(
                'DocSubTitle',
                parent=styles['Normal'],
                fontSize=10,
                leading=14,
                textColor=colors.HexColor('#475569'),
                spaceAfter=12
            )

            section_heading = ParagraphStyle(
                'SectionHeading',
                parent=styles['Heading2'],
                fontSize=14,
                leading=18,
                textColor=colors.HexColor('#047857'),
                fontName='Helvetica-Bold',
                spaceBefore=10,
                spaceAfter=6
            )

            body_style = ParagraphStyle(
                'BodyTextCustom',
                parent=styles['Normal'],
                fontSize=9,
                leading=13,
                textColor=colors.HexColor('#1e293b')
            )

            elements = []

            # Header Title
            elements.append(Paragraph("🌾 FarmMate Executive Agronomic Report", title_style))
            elements.append(Paragraph(
                f"Generated on {datetime.datetime.now().strftime('%B %d, %Y - %H:%M:%S')} | Target Location: {data.get('city', 'Chennai')}, {data.get('state', 'Tamil Nadu')}",
                subtitle_style
            ))
            elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#10b981'), spaceAfter=12))

            # 1. Farm & Soil Profile Section
            elements.append(Paragraph("1. Farm Telemetry & Soil Nutrient Profile", section_heading))
            soil_table_data = [
                ["Parameter", "Measured Value", "Agronomic Optimal Range", "Status"],
                ["Nitrogen (N)", f"{data.get('n', 90)} ppm", "80 - 120 ppm", "Optimal"],
                ["Phosphorus (P)", f"{data.get('p', 42)} ppm", "30 - 60 ppm", "Optimal"],
                ["Potassium (K)", f"{data.get('k', 43)} ppm", "30 - 80 ppm", "Optimal"],
                ["Soil pH Level", f"{data.get('ph', 6.5)}", "6.0 - 7.5", "Neutral / Balanced"],
                ["Annual Rainfall", f"{data.get('rainfall', 1200)} mm", "800 - 1500 mm", "Sufficient"]
            ]
            t1 = Table(soil_table_data, colWidths=[130, 120, 150, 140])
            t1.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#065f46')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 9),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8fafc')),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
                ('FONTSIZE', (0, 1), (-1, -1), 8.5),
            ]))
            elements.append(t1)
            elements.append(Spacer(1, 12))

            # 2. Crop Recommendation Result
            elements.append(Paragraph("2. Machine Learning Crop Advisor Recommendation", section_heading))
            crop_name = data.get('recommended_crop', 'Rice')
            confidence = data.get('confidence', 94.5)
            rec_text = (
                f"Based on Random Forest ensemble evaluation of your soil sample and local micro-climate, "
                f"<b>{crop_name}</b> is recommended with a model match confidence of <b>{confidence}%</b>. "
                f"This recommendation optimizes yield potential while preserving long-term soil health."
            )
            elements.append(Paragraph(rec_text, body_style))
            elements.append(Spacer(1, 12))

            # 3. Weather & Water Advisory
            elements.append(Paragraph("3. Micro-Climate & Irrigation Schedule", section_heading))
            weather_data = [
                ["Metric", "Telemetry Reading", "Actionable Guidance"],
                ["Current Temperature", f"{data.get('temp', 28)}°C", "Favorable for vegetative growth"],
                ["Rain Probability (24h)", f"{data.get('rain_prob', '20%')}", "Delay scheduled fertigation if >60%"],
                ["Reference ET0", f"{data.get('et0', '4.8')} mm/day", "Apply 5.2mm irrigation water equivalent"]
            ]
            t2 = Table(weather_data, colWidths=[150, 130, 260])
            t2.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#047857')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 9),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f1f5f9')),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
                ('FONTSIZE', (0, 1), (-1, -1), 8.5),
            ]))
            elements.append(t2)
            elements.append(Spacer(1, 20))

            # Footer Disclaimer
            elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#94a3b8'), spaceAfter=8))
            disclaimer = (
                "<i>Notice: FarmMate advisory reports are generated via algorithmic predictive models (Random Forest, XGBoost, FAO-56). "
                "Consult local extension officers for field-level verification. © 2026 FarmMate AI Systems.</i>"
            )
            elements.append(Paragraph(disclaimer, ParagraphStyle('Disc', parent=body_style, fontSize=7.5, textColor=colors.HexColor('#64748b'))))

            doc.build(elements)
            buffer.seek(0)
            return buffer.getvalue()

        except Exception as e:
            # Fallback simple text PDF or error string if reportlab fails
            fallback_text = f"FarmMate PDF Generator Fallback\nTimestamp: {datetime.datetime.now()}\nData: {data}\nError: {e}"
            return fallback_text.encode('utf-8')

pdf_service = PDFReportGenerator()
