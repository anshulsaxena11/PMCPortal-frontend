import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import {
  AlignmentType,
  Document,
  Header,
  Footer,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  PageNumber,
  WidthType,
  HeightRule,
  TableLayoutType,
  ShadingType,
  VerticalAlign,
  convertInchesToTwip, 
} from "docx";
import { saveAs } from "file-saver";
import dayjs from 'dayjs';
import { Chart } from 'chart.js';


// Helper to safely return string or fallback
const safeText = (text) => (text ? String(text) : "—");
const pageFooter = new Footer({
  children: [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          font: "Cambria",
          size: 20,
          children: [
            "P a g e | ",
            PageNumber.CURRENT,
            " of ",
            PageNumber.TOTAL_PAGES,
          ],
        }),
      ],
    }),
  ],
});

// Helper to fetch image as Uint8Array
const fetchImageAsUint8Array = async (url) => {
  try {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (!blob) throw new Error("Failed to convert image to blob");

    const arrayBuffer = await blob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (err) {
    console.warn("Image fetch failed:", url, err);
    return null;
  }
};

const MSWordPreview = ({ fullReport, projectDetailsReport }) => {
  
  const [showPreview, setShowPreview] = useState(false);


   const formattedStartDate = projectDetailsReport?.[0]?.startDate 
      ? dayjs(projectDetailsReport[0].startDate).format('DD/MM/YYYY') 
      : " ";
  
    const formattedEndDate = projectDetailsReport?.[0]?.endDate
      ? dayjs(projectDetailsReport[0].endDate).format('DD/MM/YYYY')
      : " ";
      

  const generateDocument = async () => {

    
    try {
      //const watermarkUrl = "/images/Confidential.png";
      //const watermarkData = await fetchImageAsUint8Array(watermarkUrl);


const logoUrl = "/images/STPI_Preview.png"; // Replace with your actual logo path
const logoData = await fetchImageAsUint8Array(logoUrl);

// Combined header with logo and watermark
const watermarkHeader = (logoData)
  ? new Header({
      children: [
        // Logo at the top-left
        new Paragraph({
          children: [
            new ImageRun({
              data: logoData,
              transformation: {
                width: 150, // Adjust logo size as needed
                height: 70,
              },
            }),
          ],
        }),
        new Paragraph({
            children: [
              new TextRun({
                 text: `${projectDetailsReport?.[0]?.projectName} ROUND-${safeText(fullReport?.[0]?.round)} REPORT,${safeText(projectDetailsReport?.[0]?.serviceLocation)}`, 
                font: "Cambria",
                size: 28,
                color:"000000",
              }),
            ],
            heading: "Heading1",
            spacing: { after: 500 },
            alignment: AlignmentType.CENTER,
          }),
      ],
    })
  : new Header({ children: [] });


        const vaptImageUrl = "/images/vapt.png";
        const vaptImageData = await fetchImageAsUint8Array(vaptImageUrl);
        const ListOfvaptImageUrl = "/images/Listofvapt.jpg";
        const ListOfvaptImageData = await fetchImageAsUint8Array(ListOfvaptImageUrl);

      const sections = [];

      // TOC section (optional)
      const tocSection = {
        headers: { default: watermarkHeader },
        footers:{default: pageFooter},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Table of Contents",
                font: "Cambria",
                size: 35,
              }),
            ],
            heading: "Heading1",
            spacing: { after: 400 },
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Page",
                font: "Cambria",
                size: 26,
              }),
            ],
            spacing: { after: 400 },
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "1.\tIntroduction\t\t\t\t\t\t\t\t\t\t4",
                font: "Cambria",
                size: 26,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "2.\tAbout VAPT\t\t\t\t\t\t\t\t\t\t5",
                font: "Cambria",
                size: 26,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "3.\tTools Used for Audit\t\t\t\t\t\t\t\t7",
                font: "Cambria",
                size: 26,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "4.\tExecutive Summary\t\t\t\t\t\t\t\t8",
                font: "Cambria",
                size: 26,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "5.\tPhase-1 Vulnerability details\t\t\t\t\t\t\t9",
                font: "Cambria",
                size: 26,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "\tA.\tList of Vulnerable Parameter, Location Discovered\t\t\t–",
                font: "Cambria",
                size: 26,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "\tB.\tVulnerable details of web application\t\t\t\t\t–",
                font: "Cambria",
                size: 26,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "\tC.\tReview of Web server\t\t\t\t\t\t\t–",
                font: "Cambria",
                size: 26,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "6.\tObservations\t\t\t\t\t\t\t\t\t–",
                font: "Cambria",
                size: 26,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "7.\tBest Practices\t\t\t\t\t\t\t\t\t48",
                font: "Cambria",
                size: 26,
              }),
            ],
          
          }),
          new Paragraph({ text: "", spacing: { after: 1000 } }),
        ],
      };
      sections.push(tocSection);
      const secondSection = {
        headers: { default: watermarkHeader },
        footers:{default: pageFooter},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `ROUND-${safeText(fullReport?.[0]?.round)} VAPT REPORT`,
                font: "Cambria",
                size: 26,
              }),
            ],
            heading: "Heading1",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "for",
                font: "Cambria",
                size: 26,
              }),
            ],
            heading: "Heading1",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "VAPT of the Official Web-Site of",
                font: "Cambria",
                size: 26,
              }),
            ],
            heading: "Heading1",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${safeText(projectDetailsReport?.[0]?.projectName)},${safeText(projectDetailsReport?.[0]?.serviceLocation)} `,
                font: "Cambria",
                size: 26,
              }),
            ],
            heading: "Heading1",
            spacing: { after: 200 },
            alignment: AlignmentType.CENTER,
          }),
          new Table({
            rows: [
              new TableRow({
                height: {
                  value: 800,
                  rule: HeightRule.EXACT,
                },
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [new Paragraph({ text: "1,", alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    width: {
                      size: 10000,
                      type: WidthType.DXA,
                    },
                    children: [new Paragraph({ text: "Auditor (Organised By)", alignment: AlignmentType.LEFT, bold:true
                     })],
                  }),
                  new TableCell({
                    width: {
                      size: 10000,
                      type: WidthType.DXA,
                    },
                    children: [new Paragraph({ text: "Software Technology Park of India (STPI)", alignment: AlignmentType.LEFT,bold:true
                     })],
                  })
                ],
              }),
              new TableRow({
                height: {
                  value: 800,
                  rule: HeightRule.EXACT,
                },
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [new Paragraph({ text: "2,", alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    width: {
                      size: 10000,
                      type: WidthType.DXA,
                    },
                    children: [new Paragraph({ text: "Report Submission date", alignment: AlignmentType.LEFT, bold:true })],
                  }),
                  new TableCell({
                    width: {
                      size: 10000,
                      type: WidthType.DXA,
                    },
                    children: [new Paragraph({ text: "Date", alignment: AlignmentType.LEFT})],
                  }),
                ],
              }),
              new TableRow({
                height: {
                  value: 800,
                  rule: HeightRule.EXACT,
                },
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [new Paragraph({ text: "3,", alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    width: {
                      size: 10000,
                      type: WidthType.DXA,
                    },
                    children: [new Paragraph({ text: "Auditee (Organised Name)", alignment: AlignmentType.LEFT, bold:true })],
                  }),
                  new TableCell({
                    width: {
                      size: 10000,
                      type: WidthType.DXA,
                    },
                    children: [new Paragraph({ text: "Name", alignment: AlignmentType.LEFT})],
                  }),
                ],
              }),
              new TableRow({
                height: {
                  value: 800,
                  rule: HeightRule.EXACT,
                },
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [new Paragraph({ text: "4,", alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    width: {
                      size: 10000,
                      type: WidthType.DXA,
                    },
                    children: [new Paragraph({ text: "VAPT reconnaissance (i.e Service delivery effective date)", alignment: AlignmentType.LEFT, bold:true })],
                  }),
                  new TableCell({
                    width: {
                      size: 10000,
                      type: WidthType.DXA,
                    },
                    children: [new Paragraph({ text: "(Information gathering) and got server access on Date for VAPT", alignment: AlignmentType.LEFT})],
                  }),
                ],
              }),
              new TableRow({
                height: {
                  value: 800,
                  rule: HeightRule.EXACT,
                },
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [new Paragraph({ text: "5,", alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    width: {
                      size: 10000,
                      type: WidthType.DXA,
                    },
                    children: [new Paragraph({ text: "VAPT duration (i.e Security assesment duration)", alignment: AlignmentType.LEFT, bold:true })],
                  }),
                  new TableCell({
                    width: {
                      size: 10000,
                      type: WidthType.DXA,
                    },
                    children: [new Paragraph({ text: `${safeText(formattedStartDate)} to ${safeText(formattedEndDate)}`, alignment: AlignmentType.LEFT})],
                  }),
                ],
              }),
              new TableRow({
                height: {
                  value: 800,
                  rule: HeightRule.EXACT,
                },
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [new Paragraph({ text: "6,", alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    width: {
                      size: 10000,
                      type: WidthType.DXA,
                    },
                    children: [new Paragraph({ text: "VAPT scope", alignment: AlignmentType.LEFT, bold:true })],
                  }),
                  new TableCell({
                    width: {
                      size: 10000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [
                          new TextRun("Remote VAPT of ICAR-IISR's official website"),
                          new TextRun({ break: 1 }), // This adds a line break
                          new TextRun("(URL:)"),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                height: {
                  value: 800,
                  rule: HeightRule.EXACT,
                },
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [new Paragraph({ text: "7,", alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    width: {
                      size: 10000,
                      type: WidthType.DXA,
                    },
                    children: [new Paragraph({ text: "STPI contact Details", alignment: AlignmentType.LEFT, bold:true })],
                  }),
                  new TableCell({
                    width: {
                      size: 10000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [
                          new TextRun({ text:"Address",bold:true}),
                          new TextRun({ break: 1 }), // This adds+ a line break
                          new TextRun("(URL:)"),
                          new TextRun({ break: 1 }),
                          new TextRun({ text:"Phone",bold:true}),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ break: 10 }),
              new TextRun({
                text: "(STPI)",
                font: "Cambria",
                size: 26,
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
        ],
      }
      sections.push(secondSection);
      
      const thirdSection = {
        headers: { default: watermarkHeader },
        footers: { default: pageFooter },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: '1. INTRODUCTION',
                font: "Cambria",
                size: 26,
              }),
            ],
            heading: "Heading1",
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "_".repeat(90), 
                color: "2F5496",
              }),
            ],
            spacing: {
              after: 200,
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '1.1. Objective',
                size: 24,
                bold:true,        
              }),
            ],
            spacing: {
              after: 200,
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Security team of "SOFTWARE TECHNOLOGY PARK OF INDIA" was engaged to understand the current security posture by conducting Vulnerability and Penetration Testing of the official website (i.e. ',
                font: "Cambria",
                size: 20,
              }),
              new TextRun({
                text: "https://stpi.in",
                font: "Cambria",
                size: 20,
                color: "0000FF",   
                underline: {},    
              }),
              new TextRun({
                text: ") of Indian Agriculture Council of Agricultural Research - Indian Institute of Soyabean Research-Indore (here after ICAR-IISR,Indore). The objective if this security assessment was to identify vulnerabilities and weakness that a web application may possess and to provide recommendations for risk mitigation. On the basis of the outcome of the security assessment, STPI Security team develops an action plan to minimize the risk.",
                font: "Cambria",
                size: 20,
              }),
            ],
          }), 
          new Paragraph({ text: "", spacing: { after: 200} }),
          new Paragraph({
            children:[
              new TextRun({
                text:'1.2.SCOPE',
                size: 24,
                bold:true,  
              })
            ]
          }),
          new Paragraph({ text: "", spacing: { after: 200} }),
          new Paragraph({
            children:[
              new TextRun({
                text: 'The security assessment was conducted on the official website web server ',
                font: "Cambria",
                size: 20,
              }),
              new TextRun({
                text: "https://iisrindore.icar.gov.in ",
                font: "Cambria",
                size: 20,
                color: "0000FF",   // Blue
                underline: {},     // Underline
              }),
              new TextRun({
                text: "(103.111.37.66) of CIAE Indore. Following activities were completed as part of the VAPT testing:",
                font: "Cambria",
                size: 20,
              }),
            ]
          }),
          new Paragraph({ text: "", spacing: { after: 200} }),
          new Paragraph({
            text: "Black box security testing of the CIAE Indore official website.",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Scope of the assessment is to ",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "✓ Identify security vulnerabilities as per OWASP Top 10: 2021. Vulnerability Assessment and      Penetration Testing (VAPT) of the static website (total static web pages : 80 nos.).",
                font: "Cambria",
                size: 20,
              }),
            ],
            spacing: { after: 100 },
            indent: { left: 600 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "✓ Details of Target :",
                font: "Cambria",
                size: 20,
              }),
            ],
            spacing: { after: 100 },
            indent: { left: 600 },
          }),
          new Table({
            rows: [
              new TableRow({
                height: {
                  value: 300,
                  rule: HeightRule.EXACT,
                },
                children: [
                  new TableCell({
                    width: { size: 2000, type: WidthType.DXA },
                    children: [new Paragraph({ text: "S.No", alignment: AlignmentType.CENTER, bold: true })],
                  }),
                  new TableCell({
                    width: { size: 2000, type: WidthType.DXA },
                    children: [new Paragraph({ text: "URL / Domain Name", alignment: AlignmentType.CENTER, bold: true })],
                  }),
                  new TableCell({
                    width: { size: 2000, type: WidthType.DXA },
                    children: [new Paragraph({ text: "IP Address", alignment: AlignmentType.CENTER, bold: true })],
                  }),
                ],
              }),
              new TableRow({
                height: {
                  value: 300,
                  rule: HeightRule.EXACT,
                },
                children: [
                  new TableCell({
                    width: { size: 2000, type: WidthType.DXA },
                    children: [new Paragraph({ text: "1.", alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    width: { size: 2000, type: WidthType.DXA },
                    children: [new Paragraph({ text: "", alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    width: { size: 2000, type: WidthType.DXA },
                    children: [new Paragraph({ text: "", alignment: AlignmentType.CENTER })],
                  }),
                ],
              }),
            ],
            width: {
              size: 6000,
              type: WidthType.DXA,
            },
            layout: TableLayoutType.FIXED,
            alignment: AlignmentType.CENTER, 
          }),
          new Paragraph({ text: "", spacing: { after: 100} }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The scope of the VAPT is limited to the VAPT Services Proposal submitted by the STPI and the information / access provided by ICAR-IISR (INDORE) team during audit.',
                font: "Cambria",
                size: 20,
              }),
            ],
          }), 
          new Paragraph({ text: "", spacing: { after: 200} }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'EXCLUSIVE',
                font: "Cambria",
                size: 24,
              }),
            ],
            heading: "Heading1",
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph({ text: "", spacing: { after: 200} }),
          new Paragraph({
            text: "Hyperlinks which are pointing to other websites.",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Application, module and functionality which are not present on the test / live – server for VAPT.",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Dynamic functionality and forwarding to another web application payment gateway : https://iisrindore.icar.gov.in/PaymentGateway/PaymentDetail.aspx.",
            bullet: { level: 0 },
            spacing: { after: 200 },
            style: "ListParagraph",
          }),
          new Paragraph({
            children:[
              new TextRun({
                text:'1.3. Report Parameter',
                size: 24,
                bold:true,  
              })
            ]
          }),
          new Paragraph({ text: "", spacing: { after: 100} }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Web Sites :',
                font: "Cambria",
                color: "0000FF", 
                size: 20,
              }),
              new TextRun({
                text: "The following sites were included : https://iisrindore.icar.gov.in (103.111.37.66)",
                font: "Cambria",
                size: 20,
              }),
            ],
            spacing: { after: 200 },
            style: "ListParagraph",
            bullet: { level: 0 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Risk Levels :',
                font: "Cambria",
                color: "0000FF", 
                size: 20,
              }),
              new TextRun({
                text: "Included :",
                font: "Cambria",
                size: 20,
              }),
              new TextRun({
                text: 'High, Medium, Low, Informational',
                font: "Cambria",
                color: "0000FF", 
                size: 20,
              }),
            ],
            style: "ListParagraph",
            bullet: { level: 0 },
          }),
          new Paragraph({ text: "", spacing: { after: 200} }),
          new Paragraph({
            children:[
              new TextRun({
                text:'1.4. DISCLAMER',
                size: 24,
                bold:true,  
              })
            ]
          }),
          new Paragraph({ text: "", spacing: { after: 100} }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'This report has been produced based on the output of the Vulnerability Assessment and Penetration Testing (VAPT) conducted on the official website web server https://iisrindore.icar.gov.in (103.111.37.66) of CIAE Indore (i.e. the server provided by the ICAR-IISR team for VAPT). Any web application system functionality, pages or resources etc. which are not made available in the test server for VAPT, is not covered by STPI.',
                font: "Cambria",
                size: 20,
              }),
            ],
            spacing: { after: 200 },
            style: "ListParagraph",
          }),
        ],
      };

      sections.push(thirdSection)

      const fourthSection={
        headers: { default: watermarkHeader },
        footers: { default: pageFooter },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: '2. ABOUT VAPT',
                font: "Cambria",
                size: 26,
              }),
            ],
            heading: "Heading1",
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "_".repeat(90), 
                color: "2F5496",
              }),
            ],
            spacing: {
              after: 200,
            },
          }),
          new Paragraph({
            children:[
              new TextRun({
                text:'2.1. VULNERABILITY ASSESSMENT AND PENETRATION TESTING (VAPT)',
                size: 24,
                bold:true,  
              })
            ]
          }), 
          new Paragraph({ text: "", spacing: { after: 200} }),
          new Paragraph({
            text: "Vulnerability Assessment (VA) is a process of identifying, quantifying, and prioritizing vulnerabilities in a system (i.e. website/web application). Penetration Testing is the process of exploiting the vulnerabilities identified.",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "VAPT provides a detailed view of the threats that a network or web application is facing / may face. It helps enterprises to protect their data, systems and applications from malicious attacks. VAPT is an essential activity to compliance the security standards.",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Security compliance protects information from unauthorized access and maintains data confidentiality which in turns protects the organisation’s reputation. Organizations must achieve compliance by establishing risk-based controls that protect the confidentiality, integrity and availability (CIA) of information. The information must be protected, whether stored, processed, integrated or transferred.",
            bullet: { level: 0 },
            spacing: { after: 200 },
            style: "ListParagraph",
          }),
          new Paragraph({
            children:[
              new TextRun({
                text:'2.2. VAPT WORK FLOW DIAGRAM',
                size: 24,
                bold:true,  
              })
            ]
          }), 
          new Paragraph({ text: "", spacing: { after: 200} }),
          new Paragraph({
            children: [
              new ImageRun({
                data: vaptImageData,
                transformation: {
                  width: 600,
                  height: 150,
                },
              }),
            ],
          }),
          new Paragraph({ text: "", spacing: { after: 200} }),
          new Paragraph({
            children:[
              new TextRun({
                text:'2.3. VAPT AUDIT PROCEDURE',
                size: 24,
                bold:true,  
              })
            ]
          }), 
          new Paragraph({ text: "", spacing: { after: 200} }),
          new Table({
            rows: [
              new TableRow({
                height: {
                  value: 300,
                  rule: HeightRule.EXACT,
                },
                children: [
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    children: [new Paragraph({ text: `VAPT ROUND-${safeText(fullReport?.[0]?.round)} `, alignment: AlignmentType.LEFT, bold: true })],
                  }),
                ],
              }),
              new TableRow({
                height: {
                  value: 300,
                  rule: HeightRule.EXACT,
                },
                children: [
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    children: [new Paragraph({ text: `Closure of the Round-${safeText(fullReport?.[0]?.round)} Vulnerabilities by the Auditee Organisation.`, alignment: AlignmentType.CENTER })],
                  }),
                ],
              }),
              new TableRow({
                height: {
                  value: 300,
                  rule: HeightRule.EXACT,
                },
                children: [
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    children: [new Paragraph({ text: `Start of VAPT Round-${safeText(fullReport?.[0]?.round+1)}`, alignment: AlignmentType.LEFT })],
                  }),
                ],
              }),
            ],
            width: {
              size: 6000,
              type: WidthType.DXA,
            },
            layout: TableLayoutType.FIXED,
            alignment: AlignmentType.CENTER, 
          }),
          new Paragraph({ text: "", spacing: { after: 100} }),
          new Paragraph({
            indent: { left: 900 }, 
            spacing: { after: 100 }, 
            children: [
              new TextRun({
                text: "I. \tFirst Round Activities", 
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 1500 }, 
            spacing: { after: 100 }, 
            children: [
              new TextRun({
                text: "a) \tTest Planning", 
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 1500 }, 
            spacing: { after: 100 }, 
            children: [
              new TextRun({
                text: "b) \tTesting", 
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 1500 }, 
            spacing: { after: 100 }, 
            children: [
              new TextRun({
                text: "c) \tPreparation of Report", 
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 1500 }, 
            spacing: { after: 100 }, 
            children: [
              new TextRun({
                text: "d) \tSubmission of Interim Anomaly Report", 
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 900 }, 
            spacing: { after: 100 }, 
            children: [
              new TextRun({
                text: "II. \tSecond/Final Round Activities", 
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 1500 }, 
            spacing: { after: 100 }, 
            children: [
              new TextRun({
                text: "a) \tVerification of defects as submitted in 1st Round Report for Closure.", 
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 1500 }, 
            spacing: { after: 100 }, 
            children: [
              new TextRun({
                text: "b) \tRe-Testing", 
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 1500 }, 
            spacing: { after: 100 }, 
            children: [
              new TextRun({
                text: "c) \tPreparation & submission of 2nd Round Report", 
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 1500 }, 
            spacing: { after: 100 }, 
            children: [
              new TextRun({
                text: "d) \tIssue of Final Test Report", 
                size: 24,
              }),
            ],
          }),
        ]
      } 

      sections.push(fourthSection)

      const fifthSection= {
        headers: { default: watermarkHeader },
        footers: { default: pageFooter },
        children:[
          new Paragraph({
            children:[
              new TextRun({
                text:'2.4. CLASSIFICATION OF THREATS',
                size: 24,
                bold:true,  
              })
            ]
          }), 
          new Paragraph({ text: "", spacing: { after: 100} }),
          new Table({
            rows: [
              new TableRow({
                height: {
                  value: 600,
                  rule: HeightRule.EXACT,
                },
                children: [
                  new TableCell({
                    width: { size:5000, type: WidthType.DXA },
                    verticalAlign: VerticalAlign.CENTER,
                    shading: {
                      type: ShadingType.CLEAR,
                      color: "auto",
                      fill: "e3dfeb", 
                    },
                    children: [new Paragraph({ text: "RISK RATING", alignment: AlignmentType.CENTER, bold: true, font:'Cambria',size:'24' })],
                  }),
                  new TableCell({
                    width: { size: 1000000, type: WidthType.DXA },
                    verticalAlign: VerticalAlign.CENTER,
                    shading: {
                      type: ShadingType.CLEAR,
                      color: "auto",
                      fill: "e3dfeb", 
                    },
                    children: [new Paragraph({ text: "DESCRIPTION", alignment: AlignmentType.CENTER, bold: true, font:'Cambria',size:'24' })],
                  }),
                ],
              }),
              new TableRow({
                height: {
                  value: 1600,
                  rule: HeightRule.EXACT,
                },
                children: [
                  new TableCell({
                    width: { size:5000, type: WidthType.DXA },
                    verticalAlign: VerticalAlign.CENTER,
                    shading: {
                      type: ShadingType.CLEAR,
                      color: "auto",
                      fill: "ff0000", 
                    },
                    children: [new Paragraph({ text: "HIGH", alignment: AlignmentType.CENTER, bold: true, font:'Cambria',size:'24' })],
                  }),
                  new TableCell({
                    width: { size: 1000000, type: WidthType.DXA },
                    margins: {
                      top: convertInchesToTwip(0.05),    
                      bottom: convertInchesToTwip(0.05),  
                      left: convertInchesToTwip(0.05),    
                      right: convertInchesToTwip(0.05),   
                    },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({ text: "These findings identify conditions that could directly result in the compromise or unauthorized access of the network, system, application or information.The defect that results in the termination of the complete system or one or more component of the system and cause extensive corruption of data. The failed function is unusable and there is no acceptable alternative method to achieve the required results then the severity will be stated as critical/high.", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
                  }),
                ],
              }),
              new TableRow({
                height: {
                  value: 1700,
                  rule: HeightRule.EXACT,
                },
                children: [
                  new TableCell({
                    width: { size:5000, type: WidthType.DXA },
                    verticalAlign: VerticalAlign.CENTER,
                    shading: {
                      type: ShadingType.CLEAR,
                      color: "auto",
                      fill: "ffc000", 
                    },
                    children: [new Paragraph({ text: "MEDIUM", alignment: AlignmentType.CENTER, bold: true, font:'Cambria',size:'24' })],
                  }),
                  new TableCell({
                    width: { size: 1000000, type: WidthType.DXA },
                    margins: {
                      top: convertInchesToTwip(0.05),    
                      bottom: convertInchesToTwip(0.05),  
                      left: convertInchesToTwip(0.05),    
                      right: convertInchesToTwip(0.05),   
                    },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({ text: "These findings identify conditions that do not immediately or directly results in the compromise or unauthorized access of the network, system, application or information, but do provide a capability or information, result in the compromise or unauthorized access of the network, system, application or information. Examples of medium risks include unprotected systems, files and services that could result in DOS on critical services or systems; and exposure of configuration information and knowledge of services or system to further exploit.", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
                  }),
                ],
              }),
              new TableRow({
                height: {
                  value: 1700,
                  rule: HeightRule.EXACT,
                },
                children: [
                  new TableCell({
                    width: { size:5000, type: WidthType.DXA },
                    verticalAlign: VerticalAlign.CENTER,
                    shading: {
                      type: ShadingType.CLEAR,
                      color: "auto",
                      fill: "ffff00", 
                    },
                    children: [new Paragraph({ text: "LOW", alignment: AlignmentType.CENTER, bold: true, font:'Cambria',size:'24' })],
                  }),
                  new TableCell({
                    width: { size: 1000000, type: WidthType.DXA },
                    margins: {
                      top: convertInchesToTwip(0.05),    
                      bottom: convertInchesToTwip(0.05),  
                      left: convertInchesToTwip(0.05),    
                      right: convertInchesToTwip(0.05),   
                    },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({ text: "These findings identify conditions that do not immediately or directly results in the compromise or unauthorized access of the network, system, application or information, but do provide a capability or information, result in the compromise or unauthorized access of the network, system, application or information. Low risk findings may also demonstrate an incomplete approach to or application of security measures within the environment. Examples of Low risks include cookies not marked secure; concurrent sessions and revealing system banners.", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
                  }),
                ],
              }),
              new TableRow({
                height: {
                  value: 1700,
                  rule: HeightRule.EXACT,
                },
                children: [
                  new TableCell({
                    width: { size:800, type: WidthType.DXA },
                    verticalAlign: VerticalAlign.CENTER,
                    shading: {
                      type: ShadingType.CLEAR,
                      color: "auto",
                      fill: "c5d9f0", 
                    },
                    children: [new Paragraph({ text: "INFO", alignment: AlignmentType.CENTER, bold: true, font:'Cambria',size:'24' })],
                  }),
                  new TableCell({
                    width: { size: 1000000, type: WidthType.DXA },
                    margins: {
                      top: convertInchesToTwip(0.05),    
                      bottom: convertInchesToTwip(0.05),  
                      left: convertInchesToTwip(0.05),    
                      right: convertInchesToTwip(0.05),   
                    },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({ text: "These findings identify conditions give additional information of the application that do not immediately or directly results in the compromise or unauthorized access of the network, system, application or information.", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
                  }),
                ],
              }),
            ],
           
          }),
        ]
      }
      sections.push(fifthSection)

      const sixthsection ={
        headers: { default: watermarkHeader },
        footers: { default: pageFooter },
        children:[
          new Paragraph({
            children: [
              new TextRun({
                text: '3. TOOLS USED FOR VAPT',
                font: "Cambria",
                size: 26,
              }),
            ],
            heading: "Heading1",
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "_".repeat(90), 
                color: "2F5496",
              }),
            ],
            spacing: {
              after: 200,
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Following software tools are used for conducting VAPT :',
                font: "Cambria",
                size: 24,
                color: "0000EE",
              }),             
            ],
            heading: "Heading1",
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph({ text: "", spacing: { after: 100} }),
          new Paragraph({
            children: [
              new TextRun({
                text: "i.", 
                size: 24,
              }),
              new TextRun({
                text: "\tNamp", 
                size: 24,
                color: "0000EE",
              }),
            ]
          }),
          new Paragraph({ text: "", spacing: { after: 100} }),
          new Paragraph({
            children: [
              new TextRun({
                text: "ii.", 
                size: 24,
              }),
              new TextRun({
                text: "\tBurp Suite", 
                size: 24,
                color: "0000EE",
              }),
            ]
          }),
          new Paragraph({ text: "", spacing: { after: 100} }),
          new Paragraph({
            children: [
              new TextRun({
                text: "iii.", 
                size: 24,
              }),
              new TextRun({
                text: "\tOWASP ZAP", 
                size: 24,
                color: "0000EE",
              }),
            ]
          }),
          new Paragraph({ text: "", spacing: { after: 100} }),
          new Paragraph({
            children: [
              new TextRun({
                text: "iv.", 
                size: 24,
              }),
              new TextRun({
                text: "\tKali Linux", 
                size: 24,
                color: "0000EE",
              }),
            ]
          }),
          new Paragraph({ text: "", spacing: { after: 100} }),
          new Paragraph({
            children: [
              new TextRun({
                text: "v.", 
                size: 24,
              }),
              new TextRun({
                text: "\tDirb", 
                size: 24,
                color: "0000EE",
              }),
            ]
          }),
          new Paragraph({ text: "", spacing: { after: 100} }),
          new Paragraph({
            children: [
              new TextRun({
                text: "vi.", 
                size: 24,
              }),
              new TextRun({
                text: "\tNikto", 
                size: 24,
                color: "0000EE",
              }),
            ]
          }),
          new Paragraph({ text: "", spacing: { after: 100} }),
          new Paragraph({
            children: [
              new TextRun({
                text: "vii.", 
                size: 24,
              }),
              new TextRun({
                text: "\tSkipfish", 
                size: 24,
                color: "0000EE",
              }),
            ]
          }),
          new Paragraph({ text: "", spacing: { after: 100} }),
          new Paragraph({
            children: [
              new TextRun({
                text: "viii.", 
                size: 24,
              }),
              new TextRun({
                text: "\tNessus", 
                size: 24,
                color: "0000EE",
              }),
            ]
          }),
          new Paragraph({ text: "", spacing: { after: 200} }),
          new Paragraph({
            children: [
              new ImageRun({
                data: ListOfvaptImageData,
                transformation: {
                  width: 600,
                  height: 500,
                },
              }),
            ],
          }),
        ]
      }
      sections.push(sixthsection)

      const seventhSection = {
        headers: { default: watermarkHeader },
        footers: { default: pageFooter },
        children:[
          new Paragraph({
            children: [
              new TextRun({
                text: '4. EXECUTIVE SUMMARY',
                font: "Cambria",
                size: 26,
              }),
            ],
            heading: "Heading1",
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "_".repeat(90), 
                color: "2F5496",
              }),
            ],
            spacing: {
              after: 200,
            },
          }),
          new Table({
            rows: [
              new TableRow({
                height: {
                  value: 400,
                  rule: HeightRule.EXACT,
                },
                children: [
                  new TableCell({
                    width: { size:1000, type: WidthType.DXA },
                    verticalAlign: VerticalAlign.CENTER,
                    margins: {
                      top: convertInchesToTwip(0.05),    
                      bottom: convertInchesToTwip(0.05),  
                      left: convertInchesToTwip(0.05),    
                      right: convertInchesToTwip(0.05),   
                    },
                    shading: {
                      type: ShadingType.CLEAR,
                      color: "auto",
                      fill: "b6dde8", 
                    },
                    children: [new Paragraph({ text: "4.1", alignment: AlignmentType.CENTER, bold: true, font:'Cambria',size:'24' })],
                  }),
                  new TableCell({
                    width: { size: 1000000, type: WidthType.DXA },
                    columnSpan:2,
                    margins: {
                      top: convertInchesToTwip(0.05),    
                      bottom: convertInchesToTwip(0.05),  
                      left: convertInchesToTwip(0.05),    
                      right: convertInchesToTwip(0.05),   
                    },
                    shading: {
                      type: ShadingType.CLEAR,
                      color: "auto",
                      fill: "b6dde8", 
                    },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({ text: "Organization Details", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
                  }),
                ],
              }),
              new TableRow({
                height: {
                  value: 400,
                  rule: HeightRule.EXACT,
                },
                children: [
                  new TableCell({
                    width: { size:1000, type: WidthType.DXA },
                    margins: {
                      top: convertInchesToTwip(0.05),    
                      bottom: convertInchesToTwip(0.05),  
                      left: convertInchesToTwip(0.05),    
                      right: convertInchesToTwip(0.05),   
                    },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({ text: "4.1.1", alignment: AlignmentType.CENTER, bold: true, font:'Cambria',size:'24' })],
                  }),
                  new TableCell({
                    width: { size: 1000,  },
                    margins: {
                      top: convertInchesToTwip(0.05),    
                      bottom: convertInchesToTwip(0.05),  
                      left: convertInchesToTwip(0.05),    
                      right: convertInchesToTwip(0.05),   
                    },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({ text: "Name of the ISA Organization", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
                  }),
                  new TableCell({
                    width: { size: 1000, type: WidthType.DXA },
                    margins: {
                      top: convertInchesToTwip(0.05),    
                      bottom: convertInchesToTwip(0.05),  
                      left: convertInchesToTwip(0.05),    
                      right: convertInchesToTwip(0.05),   
                    },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({ text: "n", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
                  }),
                ],
              }),
              new TableRow({
                height: {
                  value: 400,
                  rule: HeightRule.EXACT,
                },
                children: [
                  new TableCell({
                    width: { size:1000, type: WidthType.DXA },
                    margins: {
                      top: convertInchesToTwip(0.05),    
                      bottom: convertInchesToTwip(0.05),  
                      left: convertInchesToTwip(0.05),    
                      right: convertInchesToTwip(0.05),   
                    },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({ text: "4.1.2", alignment: AlignmentType.CENTER, bold: true, font:'Cambria',size:'24' })],
                  }),
                  new TableCell({
                    width: { size: 1000,  },
                    margins: {
                      top: convertInchesToTwip(0.05),    
                      bottom: convertInchesToTwip(0.05),  
                      left: convertInchesToTwip(0.05),    
                      right: convertInchesToTwip(0.05),   
                    },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({ text: "Address of the Organization", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
                  }),
                  new TableCell({
                    width: { size: 1000, type: WidthType.DXA },
                    margins: {
                      top: convertInchesToTwip(0.05),    
                      bottom: convertInchesToTwip(0.05),  
                      left: convertInchesToTwip(0.05),    
                      right: convertInchesToTwip(0.05),   
                    },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({ text: "n", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
                  }),
                ],
              }),
              new TableRow({
                height: {
                  value: 400,
                  rule: HeightRule.EXACT,
                },
                children: [
                  new TableCell({
                    width: { size:1000, type: WidthType.DXA },
                    verticalAlign: VerticalAlign.CENTER,
                    margins: {
                      top: convertInchesToTwip(0.05),    
                      bottom: convertInchesToTwip(0.05),  
                      left: convertInchesToTwip(0.05),    
                      right: convertInchesToTwip(0.05),   
                    },
                    shading: {
                      type: ShadingType.CLEAR,
                      color: "auto",
                      fill: "b6dde8", 
                    },
                    children: [new Paragraph({ text: "4.2", alignment: AlignmentType.CENTER, bold: true, font:'Cambria',size:'24' })],
                  }),
                  new TableCell({
                    width: { size: 1000000, type: WidthType.DXA },
                    columnSpan:2,
                    margins: {
                      top: convertInchesToTwip(0.05),    
                      bottom: convertInchesToTwip(0.05),  
                      left: convertInchesToTwip(0.05),    
                      right: convertInchesToTwip(0.05),   
                    },
                    shading: {
                      type: ShadingType.CLEAR,
                      color: "auto",
                      fill: "b6dde8", 
                    },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({ text: "Description of the Product Under Test", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
                  }),
                ],
              }),
              new TableRow({
                height: {
                  value: 700,
                  rule: HeightRule.EXACT,
                },
                children: [
                  new TableCell({
                    width: { size:1000, type: WidthType.DXA },
                    margins: {
                      top: convertInchesToTwip(0.05),    
                      bottom: convertInchesToTwip(0.05),  
                      left: convertInchesToTwip(0.05),    
                      right: convertInchesToTwip(0.05),   
                    },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({ text: "4.2.1", alignment: AlignmentType.CENTER, bold: true, font:'Cambria',size:'24' })],
                  }),
                  new TableCell({
                    width: { size: 1000,  },
                    margins: {
                      top: convertInchesToTwip(0.05),    
                      bottom: convertInchesToTwip(0.05),  
                      left: convertInchesToTwip(0.05),    
                      right: convertInchesToTwip(0.05),   
                    },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [
                          new TextRun({
                            text: "Web Application/Website",
                            bold: true,
                            font: "Cambria",
                            size: 20,
                          }),
                          new TextRun({ break: 1 }), // line break
                          new TextRun({
                            text: "(i.e. website IP add./URL)",
                            font: "Cambria",
                            size: 24,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 1000, type: WidthType.DXA },
                    margins: {
                      top: convertInchesToTwip(0.05),    
                      bottom: convertInchesToTwip(0.05),  
                      left: convertInchesToTwip(0.05),    
                      right: convertInchesToTwip(0.05),   
                    },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [
                          new TextRun({
                            text: "IP Address:",
                            bold: true,
                            font: "Cambria",
                            size: 20,
                          }),
                          new TextRun({
                            text: "",
                            font: "Cambria",
                            size: 24,
                          }),
                          new TextRun({ break: 1 }), // line break
                          new TextRun({
                            text: "URL:",
                            font: "Cambria",
                            size: 20,
                            bold: true,
                          }),
                          new TextRun({
                            text: "URL:",
                            font: "Cambria",
                            size: 24,
                            bold: true,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
               new TableRow({
                height: {
                  value: 400,
                  rule: HeightRule.EXACT,
                },
                children: [
                  new TableCell({
                    width: { size:1000, type: WidthType.DXA },
                    verticalAlign: VerticalAlign.CENTER,
                    margins: {
                      top: convertInchesToTwip(0.05),    
                      bottom: convertInchesToTwip(0.05),  
                      left: convertInchesToTwip(0.05),    
                      right: convertInchesToTwip(0.05),   
                    },
                    shading: {
                      type: ShadingType.CLEAR,
                      color: "auto",
                      fill: "b6dde8", 
                    },
                    children: [new Paragraph({ text: "4.3", alignment: AlignmentType.CENTER, bold: true, font:'Cambria',size:'24' })],
                  }),
                  new TableCell({
                    width: { size: 1000000, type: WidthType.DXA },
                    columnSpan:2,
                    margins: {
                      top: convertInchesToTwip(0.05),    
                      bottom: convertInchesToTwip(0.05),  
                      left: convertInchesToTwip(0.05),    
                      right: convertInchesToTwip(0.05),   
                    },
                    shading: {
                      type: ShadingType.CLEAR,
                      color: "auto",
                      fill: "b6dde8", 
                    },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({ text: "Description of Test", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
                  }),
                ],
              }),
                new TableRow({
            height: {
              value: 400,
              rule: HeightRule.EXACT,
            },
            children: [
              new TableCell({
                width: { size:1000, type: WidthType.DXA },
                margins: {
                  top: convertInchesToTwip(0.05),    
                  bottom: convertInchesToTwip(0.05),  
                  left: convertInchesToTwip(0.05),    
                  right: convertInchesToTwip(0.05),   
                },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ text: "4.3.1", alignment: AlignmentType.CENTER, bold: true, font:'Cambria',size:'24' })],
              }),
              new TableCell({
                width: { size: 1000,  },
                margins: {
                  top: convertInchesToTwip(0.05),    
                  bottom: convertInchesToTwip(0.05),  
                  left: convertInchesToTwip(0.05),    
                  right: convertInchesToTwip(0.05),   
                },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ text: "Customer Name and Address", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
              }),
              new TableCell({
                width: { size: 1000, type: WidthType.DXA },
                margins: {
                  top: convertInchesToTwip(0.05),    
                  bottom: convertInchesToTwip(0.05),  
                  left: convertInchesToTwip(0.05),    
                  right: convertInchesToTwip(0.05),   
                },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ text: "n", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
              }),
            ],
          }),
          new TableRow({
            height: {
              value: 400,
              rule: HeightRule.EXACT,
            },
            children: [
              new TableCell({
                width: { size:1000, type: WidthType.DXA },
                margins: {
                  top: convertInchesToTwip(0.05),    
                  bottom: convertInchesToTwip(0.05),  
                  left: convertInchesToTwip(0.05),    
                  right: convertInchesToTwip(0.05),   
                },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ text: "4.3.2", alignment: AlignmentType.CENTER, bold: true, font:'Cambria',size:'24' })],
              }),
              new TableCell({
                width: { size: 1000,  },
                margins: {
                  top: convertInchesToTwip(0.05),    
                  bottom: convertInchesToTwip(0.05),  
                  left: convertInchesToTwip(0.05),    
                  right: convertInchesToTwip(0.05),   
                },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ text: "Location of Testing", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
              }),
              new TableCell({
                width: { size: 1000, type: WidthType.DXA },
                margins: {
                  top: convertInchesToTwip(0.05),    
                  bottom: convertInchesToTwip(0.05),  
                  left: convertInchesToTwip(0.05),    
                  right: convertInchesToTwip(0.05),   
                },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ text: "n", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
              }),
            ],
          }),
          new TableRow({
            height: {
              value: 400,
              rule: HeightRule.EXACT,
            },
            children: [
              new TableCell({
                width: { size:1000, type: WidthType.DXA },
                margins: {
                  top: convertInchesToTwip(0.05),    
                  bottom: convertInchesToTwip(0.05),  
                  left: convertInchesToTwip(0.05),    
                  right: convertInchesToTwip(0.05),   
                },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ text: "4.3.3", alignment: AlignmentType.CENTER, bold: true, font:'Cambria',size:'24' })],
              }),
              new TableCell({
                width: { size: 1000,  },
                margins: {
                  top: convertInchesToTwip(0.05),    
                  bottom: convertInchesToTwip(0.05),  
                  left: convertInchesToTwip(0.05),    
                  right: convertInchesToTwip(0.05),   
                },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ text: "VAPT Test Scope", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
              }),
              new TableCell({
                width: { size: 1000, type: WidthType.DXA },
                margins: {
                  top: convertInchesToTwip(0.05),    
                  bottom: convertInchesToTwip(0.05),  
                  left: convertInchesToTwip(0.05),    
                  right: convertInchesToTwip(0.05),   
                },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ text: "n", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
              }),
            ],
          }),
          new TableRow({
            height: {
              value: 400,
              rule: HeightRule.EXACT,
            },
            children: [
              new TableCell({
                width: { size:1000, type: WidthType.DXA },
                margins: {
                  top: convertInchesToTwip(0.05),    
                  bottom: convertInchesToTwip(0.05),  
                  left: convertInchesToTwip(0.05),    
                  right: convertInchesToTwip(0.05),   
                },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ text: "4.3.4", alignment: AlignmentType.CENTER, bold: true, font:'Cambria',size:'24' })],
              }),
              new TableCell({
                width: { size: 1000,  },
                margins: {
                  top: convertInchesToTwip(0.05),    
                  bottom: convertInchesToTwip(0.05),  
                  left: convertInchesToTwip(0.05),    
                  right: convertInchesToTwip(0.05),   
                },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ text: "Test Methodologies", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
              }),
              new TableCell({
                width: { size: 1000, type: WidthType.DXA },
                margins: {
                  top: convertInchesToTwip(0.05),    
                  bottom: convertInchesToTwip(0.05),  
                  left: convertInchesToTwip(0.05),    
                  right: convertInchesToTwip(0.05),   
                },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ text: "n", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
              }),
            ],
          }),
          new TableRow({
            height: {
              value: 400,
              rule: HeightRule.EXACT,
            },
            children: [
              new TableCell({
                width: { size:1000, type: WidthType.DXA },
                margins: {
                  top: convertInchesToTwip(0.05),    
                  bottom: convertInchesToTwip(0.05),  
                  left: convertInchesToTwip(0.05),    
                  right: convertInchesToTwip(0.05),   
                },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ text: "4.3.5", alignment: AlignmentType.CENTER, bold: true, font:'Cambria',size:'24' })],
              }),
              new TableCell({
                width: { size: 1000,  },
                margins: {
                  top: convertInchesToTwip(0.05),    
                  bottom: convertInchesToTwip(0.05),  
                  left: convertInchesToTwip(0.05),    
                  right: convertInchesToTwip(0.05),   
                },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ text: "Generated Test Data", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
              }),
              new TableCell({
                width: { size: 1000, type: WidthType.DXA },
                margins: {
                  top: convertInchesToTwip(0.05),    
                  bottom: convertInchesToTwip(0.05),  
                  left: convertInchesToTwip(0.05),    
                  right: convertInchesToTwip(0.05),   
                },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ text: "n", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
              }),
            ],
          }),
          new TableRow({
            height: {
              value: 400,
              rule: HeightRule.EXACT,
            },
            children: [
              new TableCell({
                width: { size:1000, type: WidthType.DXA },
                rowSpan:2,
                margins: {
                  top: convertInchesToTwip(0.05),    
                  bottom: convertInchesToTwip(0.05),  
                  left: convertInchesToTwip(0.05),    
                  right: convertInchesToTwip(0.05),   
                },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ text: "4.3.6", alignment: AlignmentType.CENTER, bold: true, font:'Cambria',size:'24' })],
              }),
              new TableCell({
                width: { size: 1000,  },
                margins: {
                  top: convertInchesToTwip(0.05),    
                  bottom: convertInchesToTwip(0.05),  
                  left: convertInchesToTwip(0.05),    
                  right: convertInchesToTwip(0.05),   
                },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ text: "Tools used to conduct VAPT :", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
              }),
              new TableCell({
                width: { size: 1000, type: WidthType.DXA },
                margins: {
                  top: convertInchesToTwip(0.05),    
                  bottom: convertInchesToTwip(0.05),  
                  left: convertInchesToTwip(0.05),    
                  right: convertInchesToTwip(0.05),   
                },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ text: "n", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
              }),
            ],
          }),
           new TableRow({
            height: {
              value: 800,
              rule: HeightRule.EXACT,
            },
            children: [
              new TableCell({
                width: { size:3000,},
                margins: {
                  top: convertInchesToTwip(0.05),    
                  bottom: convertInchesToTwip(0.05),  
                  left: convertInchesToTwip(0.05),    
                  right: convertInchesToTwip(0.05),   
                },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ text: "Web Application Details", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
              }),
              new TableCell({
                width: { size: 1000,  },
                margins: {
                  top: convertInchesToTwip(0.05),    
                  bottom: convertInchesToTwip(0.05),  
                  left: convertInchesToTwip(0.05),    
                  right: convertInchesToTwip(0.05),   
                },
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.LEFT,
                    children: [
                      new TextRun({
                        text: "IP Address:",
                        bold: true,
                        font: "Cambria",
                        size: 20,
                      }),
                      new TextRun({
                        text: "",
                        font: "Cambria",
                        size: 24,
                      }),
                      new TextRun({ break: 1 }), // line break
                      new TextRun({
                        text: "URL:",
                        font: "Cambria",
                        size: 20,
                        bold: true,
                      }),
                      new TextRun({
                        text: "URL:",
                        font: "Cambria",
                        size: 24,
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),          
        ],           
      }),
      ]
    }
    sections.push(seventhSection)

    const severityArray = (fullReport || []).map(item => item.sevirty).filter(Boolean);

    const countMap = { high: 0, medium: 0, low: 0,informational:0 };
    severityArray.forEach((level) => {
      const normalized = level.trim().toLowerCase();
      if (normalized === "high") countMap.high++;
      else if (normalized === "medium") countMap.medium++;
      else if (normalized === "low") countMap.low++;
      else if (normalized === "informational") countMap.informational++;
    });
    
    // 2. Get max value and label
    const [maxSeverityLabelRaw, maxValue] = Object.entries(countMap).reduce(
      (max, entry) => (entry[1] > max[1] ? entry : max),
      ["", 0]
    );
    
    const maxSeverityLabel = maxSeverityLabelRaw.toLowerCase();
    
    // 3. Create risk table
    const overallRiskTable = new Table({
      rows: [
        new TableRow({
          height: {
            value: 800,
            rule: HeightRule.EXACT,
          },
          children: [
            new TableCell({
              width: {
                size: 3000,
              },
              margins: {
                top: convertInchesToTwip(0.05),
                bottom: convertInchesToTwip(0.05),
                left: convertInchesToTwip(0.05),
                right: convertInchesToTwip(0.05),
              },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [
                    new TextRun({
                      text: "Overall Risk Level : ",
                      bold: true,
                      font: { name: "Cambria" },
                      size: 24,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          height: {
            value: 800,
            rule: HeightRule.EXACT,
          },
          children: [
            new TableCell({
              width: {
                size: 3000,
              },
              margins: {
                top: convertInchesToTwip(0.05),
                bottom: convertInchesToTwip(0.05),
                left: convertInchesToTwip(0.05),
                right: convertInchesToTwip(0.05),
              },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [
                    new TextRun({
                      text: maxSeverityLabel.toUpperCase(),
                      bold: true,
                      font: { name: "Cambria" },
                      size: 24,
                      shading: {
                        fill:  // Background color
                          maxSeverityLabel === "high"
                            ? "FF0000" // Red background
                            : maxSeverityLabel === "medium"
                            ? "ffc000" 
                            : maxSeverityLabel === "low"
                            ? "ffff00"
                            : "c5d9f0", 
                      },
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });

    const severityBarChart = [
      new Table({
        rows: [
          // Row for Risk Rating Header
          new TableRow({
            children: [
              new TableCell({
                width: { size: 7000 },
                verticalAlign: VerticalAlign.CENTER,
                margins: {
                  top: convertInchesToTwip(0.05),
                  bottom: convertInchesToTwip(0.05),
                  left: convertInchesToTwip(0.1),
                  right: convertInchesToTwip(0.1),
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: "Risk Rating",
                        bold: true,
                        font: { name: "Cambria" },
                        size: 24,
                      }),
                    ],
                    spacing: { after: 200 },
                  }),
                ],
              }),
            ],
          }),
          // Row for HIGH
          new TableRow({
            children: [
              new TableCell({
                width: { size: 2000 },
                verticalAlign: VerticalAlign.CENTER,
                margins: {
                  top: convertInchesToTwip(0.05),
                  bottom: convertInchesToTwip(0.05),
                  left: convertInchesToTwip(0.05),
                  right: convertInchesToTwip(0.05),
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "HIGH",
                        bold: true,
                        font: { name: "Cambria" },
                        size: 20,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 5000 },
                verticalAlign: VerticalAlign.CENTER,
                margins: {
                  top: convertInchesToTwip(0.05),
                  bottom: convertInchesToTwip(0.05),
                  left: convertInchesToTwip(0.05),
                  right: convertInchesToTwip(0.05),
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${"█".repeat(Math.round((countMap.high / maxValue) * 50))} (${countMap.high})`,
                        font: { name: "Courier New" },
                        size: 20,
                        color: "FF0000",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          // Row for MEDIUM
          new TableRow({
            children: [
              new TableCell({
                width: { size: 2000 },
                verticalAlign: VerticalAlign.CENTER,
                margins: {
                  top: convertInchesToTwip(0.05),
                  bottom: convertInchesToTwip(0.05),
                  left: convertInchesToTwip(0.05),
                  right: convertInchesToTwip(0.05),
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "MEDIUM",
                        bold: true,
                        font: { name: "Cambria" },
                        size: 20,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 5000 },
                verticalAlign: VerticalAlign.CENTER,
                margins: {
                  top: convertInchesToTwip(0.05),
                  bottom: convertInchesToTwip(0.05),
                  left: convertInchesToTwip(0.05),
                  right: convertInchesToTwip(0.05),
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${"█".repeat(Math.round((countMap.medium / maxValue) * 50))} (${countMap.medium})`,
                        font: { name: "Courier New" },
                        size: 20,
                        color: "ffc000",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          // Row for LOW
          new TableRow({
            children: [
              new TableCell({
                width: { size: 2000 },
                verticalAlign: VerticalAlign.CENTER,
                margins: {
                  top: convertInchesToTwip(0.05),
                  bottom: convertInchesToTwip(0.05),
                  left: convertInchesToTwip(0.05),
                  right: convertInchesToTwip(0.05),
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "LOW",
                        bold: true,
                        font: { name: "Cambria" },
                        size: 20,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 5000 },
                verticalAlign: VerticalAlign.CENTER,
                margins: {
                  top: convertInchesToTwip(0.05),
                  bottom: convertInchesToTwip(0.05),
                  left: convertInchesToTwip(0.05),
                  right: convertInchesToTwip(0.05),
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${"█".repeat(Math.round((countMap.low / maxValue) * 50))} (${countMap.low})`,
                        font: { name: "Courier New" },
                        size: 20,
                        color: "ffff00",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                width: { size: 2000 },
                verticalAlign: VerticalAlign.CENTER,
                margins: {
                  top: convertInchesToTwip(0.05),
                  bottom: convertInchesToTwip(0.05),
                  left: convertInchesToTwip(0.05),
                  right: convertInchesToTwip(0.05),
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Informational",
                        bold: true,
                        font: { name: "Cambria" },
                        size: 20,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 5000 },
                verticalAlign: VerticalAlign.CENTER,
                margins: {
                  top: convertInchesToTwip(0.05),
                  bottom: convertInchesToTwip(0.05),
                  left: convertInchesToTwip(0.05),
                  right: convertInchesToTwip(0.05),
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${"█".repeat(Math.round((countMap.informational / maxValue) * 50))} (${countMap.informational})`,
                        font: { name: "Courier New" },
                        size: 20,
                        color: "c5d9f0",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ];
    


    const eightSection = {
      headers: { default: watermarkHeader },
      footers: { default: pageFooter },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: `5. ROUND-${safeText(fullReport?.[0]?.round)} VULNERABILITY DETAILS`,
              font: { name: "Cambria" },
              size: 26,
            }),
          ],
          heading: "Heading1",
          alignment: AlignmentType.RIGHT,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "_".repeat(90),
              color: "2F5496",
            }),
          ],
          spacing: {
            after: 200,
          },
        }),
        overallRiskTable,
        new Paragraph({ text: "", spacing: { after: 200} }),
        ...severityBarChart,
        new Paragraph({ text: "", spacing: { after: 200} }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Alert count by site and risk`,
              font: { name: "Cambria" },
              size: 24,
            }),
          ],
          heading: "Heading1",
          alignment: AlignmentType.LEFT,
        }),
        new Paragraph({ text: "", spacing: { after: 200} }),
        new Table({
          rows: [
            new TableRow({
              height: {
                value: 400,
                rule: HeightRule.EXACT,
              },
              children: [
                new TableCell({
                  width: { size:1000, type: WidthType.DXA },
                  rowSpan:2,
                  margins: {
                    top: convertInchesToTwip(0.05),    
                    bottom: convertInchesToTwip(0.05),  
                    left: convertInchesToTwip(0.05),    
                    right: convertInchesToTwip(0.05),   
                  },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ text: "http", alignment: AlignmentType.CENTER, bold: true, font:'Cambria',size:'24' })],
                }),
                new TableCell({
                  width: { size: 10000000,  },
                  columnSpan:4,
                  margins: {
                    top: convertInchesToTwip(0.05),    
                    bottom: convertInchesToTwip(0.05),  
                    left: convertInchesToTwip(0.05),    
                    right: convertInchesToTwip(0.05),   
                  },
                  shading: {
                    type: ShadingType.CLEAR,
                    color: "auto",
                    fill: "f1dbdb", 
                  },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ text: "Risk Levels", alignment: AlignmentType.CENTER, bold: true, font:'Cambria',size:'24' })],
                }),
              ],
            }),
            new TableRow({
              height: {
                value: 800,
                rule: HeightRule.EXACT,
              },
              children: [
                new TableCell({
                  width: { size:3000,},
                  margins: {
                    top: convertInchesToTwip(0.05),    
                    bottom: convertInchesToTwip(0.05),  
                    left: convertInchesToTwip(0.05),    
                    right: convertInchesToTwip(0.05),   
                  },
                  shading: {
                    type: ShadingType.CLEAR,
                    color: "auto",
                    fill: "FF0000", 
                  },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ text: "(= HIGH)", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
                }),
                new TableCell({
                  width: { size:3000,},
                  margins: {
                    top: convertInchesToTwip(0.05),    
                    bottom: convertInchesToTwip(0.05),  
                    left: convertInchesToTwip(0.05),    
                    right: convertInchesToTwip(0.05),   
                  },
                  shading: {
                    type: ShadingType.CLEAR,
                    color: "auto",
                    fill: "ffc000", 
                  },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ text: "(> = MEDIUM)", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
                }),
                new TableCell({
                  width: { size:3000,},
                  margins: {
                    top: convertInchesToTwip(0.05),    
                    bottom: convertInchesToTwip(0.05),  
                    left: convertInchesToTwip(0.05),    
                    right: convertInchesToTwip(0.05),   
                  },
                  shading: {
                    type: ShadingType.CLEAR,
                    color: "auto",
                    fill: "ffff00", 
                  },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ text: "(> = LOW)", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
                }),
                new TableCell({
                  width: { size:3000,},
                  margins: {
                    top: convertInchesToTwip(0.05),    
                    bottom: convertInchesToTwip(0.05),  
                    left: convertInchesToTwip(0.05),    
                    right: convertInchesToTwip(0.05),   
                  },
                  shading: {
                    type: ShadingType.CLEAR,
                    color: "auto",
                    fill: "c5d9f0", 
                  },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ text: "(> = Informational)", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
                }),
              ]
            }),
            new TableRow({
              height: {
                value: 800,
                rule: HeightRule.EXACT,
              },
              children: [
                new TableCell({
                  width: { size:30000,},
                  margins: {
                    top: convertInchesToTwip(0.05),    
                    bottom: convertInchesToTwip(0.05),  
                    left: convertInchesToTwip(0.05),    
                    right: convertInchesToTwip(0.05),   
                  },
                  shading: {
                    type: ShadingType.CLEAR,
                    color: "auto",
                    fill: "f1dbdb", 
                  },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ text: "Vulnerability Numbers", alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
                }),
                new TableCell({
                  width: { size:30000,},
                  margins: {
                    top: convertInchesToTwip(0.05),    
                    bottom: convertInchesToTwip(0.05),  
                    left: convertInchesToTwip(0.05),    
                    right: convertInchesToTwip(0.05),   
                  },
                  shading: {
                    type: ShadingType.CLEAR,
                    color: "auto",
                    fill: "FF0000", 
                  },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ text: `${countMap.high}`, alignment: AlignmentType.CENTER, bold: true, font:'Cambria',size:'24' })],
                }),
                new TableCell({
                  width: { size:30000,},
                  margins: {
                    top: convertInchesToTwip(0.05),    
                    bottom: convertInchesToTwip(0.05),  
                    left: convertInchesToTwip(0.05),    
                    right: convertInchesToTwip(0.05),   
                  },
                  shading: {
                    type: ShadingType.CLEAR,
                    color: "auto",
                    fill: "ffc000", 
                  },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ text: `${countMap.medium}`, alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
                }),
                new TableCell({
                  width: { size:30000,},
                  margins: {
                    top: convertInchesToTwip(0.05),    
                    bottom: convertInchesToTwip(0.05),  
                    left: convertInchesToTwip(0.05),    
                    right: convertInchesToTwip(0.05),   
                  },
                  shading: {
                    type: ShadingType.CLEAR,
                    color: "auto",
                    fill: "ffff00", 
                  },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ text: `${countMap.low}`, alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
                }),
                new TableCell({
                  width: { size:30000,},
                  margins: {
                    top: convertInchesToTwip(0.05),    
                    bottom: convertInchesToTwip(0.05),  
                    left: convertInchesToTwip(0.05),    
                    right: convertInchesToTwip(0.05),   
                  },
                  shading: {
                    type: ShadingType.CLEAR,
                    color: "auto",
                    fill: "c5d9f0", 
                  },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ text: `${countMap.informational}`, alignment: AlignmentType.LEFT, bold: true, font:'Cambria',size:'24' })],
                }),
              ]
            })

          ],
        }),
      ],
    };
    sections.push(eightSection)

    const severityTotals = fullReport.reduce((acc, curr) => {
      const severity = safeText(curr.sevirty);
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {});
    
    const totalText = Object.entries(severityTotals)
      .map(([level, count]) => `${level}: ${count}`)
      .join(" | ");

      const cellMargin = {
        top: convertInchesToTwip(0.05),
        bottom: convertInchesToTwip(0.05),
        left: convertInchesToTwip(0.05),
        right: convertInchesToTwip(0.05),
      };
    const ninthSection = {
      headers: { default: watermarkHeader },
      footers: { default: pageFooter },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: `ROUND-${safeText(fullReport?.[0]?.round)} VULNERABILITY DETAILS`,
              font: { name: "Cambria" },
              size: 26,
            }),
          ],
          heading: "Heading1",
          alignment: AlignmentType.LEFT,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "_".repeat(90),
              color: "2F5496",
            }),
          ],
          spacing: { after: 200 },
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            // Header row
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 10000000 },
                  columnSpan: 1,
                  margins: cellMargin,
                  shading: { type: ShadingType.CLEAR, color: "auto", fill: "f1dbdb" },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      text: "S.NO",
                      alignment: AlignmentType.CENTER,
                      bold: true,
                      font: "Cambria",
                      size: "24",
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 10000000 },
                  columnSpan: 1,
                  margins: cellMargin,
                  shading: { type: ShadingType.CLEAR, color: "auto", fill: "f1dbdb" },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      text: "Vulnerability Name",
                      alignment: AlignmentType.CENTER,
                      bold: true,
                      font: "Cambria",
                      size: "24",
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 10000000 },
                  columnSpan: 1,
                  margins: cellMargin,
                  shading: { type: ShadingType.CLEAR, color: "auto", fill: "f1dbdb" },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      text: "Risk Level",
                      alignment: AlignmentType.CENTER,
                      bold: true,
                      font: "Cambria",
                      size: "24",
                    }),
                  ],
                }),
              ],
            }),
    
            // Data rows
            ...fullReport.map((item, idx) => {
              const severity = safeText(item.sevirty);
              const totalCount = fullReport.filter(vuln => safeText(vuln.sevirty) === severity).length;
    
              return new TableRow({
                children: [
                  new TableCell({
                    margins: cellMargin,
                    children: [new Paragraph({ text: String(idx + 1), alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    margins: cellMargin,
                    children: [new Paragraph({ text: safeText(item.vulnerabilityName), alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    margins: cellMargin,
                    children: [new Paragraph({ text: `${severity} (${totalCount})`, alignment: AlignmentType.CENTER })],
                  }),
                ],
              });
            }),
    
            // TOTAL row
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 10000000 },
                  columnSpan: 1,
                  margins: cellMargin,
                  shading: { type: ShadingType.CLEAR, color: "auto", fill: "f1dbdb" },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ text: "", alignment: AlignmentType.CENTER })],
                }),
                new TableCell({
                  width: { size: 10000000 },
                  columnSpan: 1,
                  margins: cellMargin,
                  shading: { type: ShadingType.CLEAR, color: "auto", fill: "f1dbdb" },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      text: "TOTAL",
                      alignment: AlignmentType.CENTER,
                      bold: true,
                      font: "Cambria",
                      size: "24",
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 10000000 },
                  columnSpan: 1,
                  margins: cellMargin,
                  shading: { type: ShadingType.CLEAR, color: "auto", fill: "f1dbdb" },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      text: totalText,
                      alignment: AlignmentType.CENTER,
                      bold: true,
                      font: "Cambria",
                      size: "24",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    };
    sections.push(ninthSection)

      // Each vulnerability as a separate section
      for (const [index, item] of fullReport.entries()) {
        const sectionChildren = [];

        sectionChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Vulnerability No ${index + 1}`,
                bold: true,
                size: 28,
              }),
            ],
            spacing: { after: 300 },
          })
        );
          let bgColor = "#FFFFFF";
          if (item.sevirty === "High") {
                      bgColor = "#FF0000";
                    } else if (item.sevirty === "Medium") {
                      bgColor = "#FFA500";
                    } else if (item.sevirty === "Low") {
                      bgColor = "#008000";
                    }else if (item.sevirty === "INFO") {
                      bgColor = "#0000FF";
                    }
                  

        const rows = [
  ["Project Name", safeText(projectDetailsReport?.[0]?.projectName)],
  ["Project Type", safeText(item.projectType)],
  item.projectType === 'Network Devices' && ["Device Type", safeText(item.devices)],
  item.projectType === 'Network Devices' && ["Device Name", safeText(item.Name)],
  item.projectType === 'Network Devices' && ["Device Ip", safeText(item.ipAddress)],
  ["Vulnerability Name/Type", safeText(item.vulnerabilityName)],
  ["Severity", safeText(item.sevirty)],
  ["Description", safeText(item.description)],
  ["Location", safeText(item.path)],
  ["IMPACT", safeText(item.impact)],  
  ["Vulnerable Parameter", safeText(item.vulnerableParameter)],
  ["References", safeText(item.references)],
  ["Recomendation", safeText(item.recomendation)],
].filter(Boolean).map(([title, value]) =>
  new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph(title)],
        shading: {
          type: ShadingType.CLEAR,
          color: "auto",
          fill: "#b6dde8", // light blue background for titles
        },
      }),
      new TableCell({
        children: [new Paragraph(value)],
        ...(title === "Severity" && {
          shading: {
            type: ShadingType.CLEAR,
            color: "auto",
            fill: bgColor, 
          },
        }),
      }),
    ],
  })
);

        if (Array.isArray(item.proofOfConcept) && item.proofOfConcept.length > 0) {
          const proofParagraphs = [];

          for (const proof of item.proofOfConcept) {
            if (proof.noOfSteps) {
              proofParagraphs.push(
                new Paragraph({
                  children: [new TextRun(proof.noOfSteps)],
                  spacing: { after: 200 },
                })
              );
            }
             if (proof.description) {
              proofParagraphs.push(
                new Paragraph({
                  children: [new TextRun(proof.description)],
                  spacing: { after: 200 },
                })
              );
            }

            if (proof.proof) {
              const imageData = await fetchImageAsUint8Array(proof.proof);
              if (imageData && imageData.length > 0) {
                proofParagraphs.push(
                  new Paragraph({
                    children: [
                      new ImageRun({
                        data: imageData,
                        transformation: {
                          width: 500,
                          height: 150,
                          padding:50,
                        },
                      }),
                    ],
                    spacing: { after: 300 },
                  })
                );
              } else {
                proofParagraphs.push(
                  new Paragraph("⚠️ Image could not be loaded.")
                );
              }
            }
          }

          rows.push(
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("Proof of Concept")],shading: {
                    type: ShadingType.CLEAR,
                    color: "auto",
                    fill: "#b6dde8", // light gray background
                  },
                }),
                new TableCell({ children: proofParagraphs }),
              ],
            })
          );
        }

        sectionChildren.push(new Table({ rows }));
        sectionChildren.push(new Paragraph({ text: "", spacing: { after: 400 } }));

        sections.push({
          headers: { default: watermarkHeader },
          children: sectionChildren,
        });
      }

      const eleventSection={
        headers: { default: watermarkHeader },
        footers: { default: pageFooter },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Best Practices /Recommendation to secure the WebApplication",
                font: { name: "Cambria" },
                size: 26,
              }),
            ],
            heading: "Heading1",
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "_".repeat(90),
                color: "2F5496",
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "Use SSL Certificate Site wide on all websites. The SSL Certificate should use at least 2048 bit SHA256 encryption or higher",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Ensure that the SSL Certificate is valid and keep track of the certificate expiry date and takenecessary action to renew/replace the certificate before expiry.",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Disable support for SSL 2.0, SSL3.0, and TLS 1.0 at the server level. Use TLS 1.2.",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Disable weak ciphers like DES, 3DES, RC4. Use Strong Ciphers like AES, GCM.",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Any “non-https” requests received on the website/applications, should be forcefully redirected to “https”.",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Ensure that all Websites and Applications and their respective CMS (Content Management System), 3rd party plugins, codes etc., are updated to the latest versions",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "All Passwords, connection strings, tokens, keys etc., should be encrypted with salted hash. There should not be any plain passwords stored in config files or source code or in database",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "All exceptions should be handled appropriately. Custom error pages should be displayed for any errors/exceptions. At no point of time, a portion of source code should be displayed on the page incase of an error or exception.",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Directory traversal should be disabled. In case of any specific attempt by a user to access a portionof the code by typing the URL path (ex: www.xx.gov.in/js/custom.js) then the same should be redirected to a custom error page.",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "HttpOnly Cookies should be enabled, to restrict access to cookies",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "The Web Server processes should not be running under Administrator or Root user Account. A dedicated User account with limited privileges should be used for the Web Server Processes.",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Write + Execute Permission - both should not be given to upload directory",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Ensure Input Validation is done properly, while accepting input from the user through the website.",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Maximum Length for all the input field should be restricted and client and server side validation should be implemented for sanitizing the hazardous characters.",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Ensure that the Computer/system, from where CMS/site updates are being done is installed with the latest OS + Antivirus Updates and Patches. No unauthorized software/cracks, should beinstalled on the machine.",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Restrict the web application to run Stored Procedures, so that SQL Injection attempts are averted.",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Disable the version disclosure of the Services like (IIS, Apache, PHP, Database etc.)",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Implement account lockout for login pages.",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "If your website/application is integrated with any 3rd party Applications or using any APIs for external communication, then ensure that all such communications are done through encrypted channel.",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Disable unwanted ports/Services to the external network and keep the application behind the firewall.",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "If application is having any file upload functionality, restrict the file type as per the required fileonly (i.e. .pdf, image) file with limited file size.",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Implement the relevant security headers for the Application in webconfig. Please refer thefollowing urls :",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "https://www.netsparker.com/blog/web-security/http-security-headers/",
            bullet: { level: 1 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "https://owasp.org/www-project-secure-headers/",
            bullet: { level: 1 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Implement the secure password policy, please follow the below mentioned points while setting thepassword.",
            bullet: { level: 0 },
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Disallow common user name and passwords.",
            bullet: { level: 1},
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Disallow dictionary based password",
            bullet: { level: 1},
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Minimum length above 8 characters with a mix of alphanumeric and special characters",
            bullet: { level: 1},
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
          new Paragraph({
            text: "Periodic change of passwords.",
            bullet: { level: 1},
            spacing: { after: 100 },
            style: "ListParagraph",
          }),
        ]
      }

      sections.push(eleventSection)

      const doc = new Document({
        creator: "StpiNoida",
        title: `${projectDetailsReport?.[0]?.projectName}_Round-${fullReport?.[0]?.round} `,
        description: "Generated vulnerability report",
        sections: sections,
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${projectDetailsReport?.[0]?.projectName}_Round-${fullReport?.[0]?.round}.docx`);
    } catch (error) {
      console.error("Document generation failed:", error);
      alert("Failed to generate Word document. Please check the data and try again.");
    }
  };

  return (
    <>
      <Button variant="info" onClick={() => setShowPreview(true)}>
        Preview MS Word Report
      </Button>
      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>MS Word Report Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
         <h1>Click on Download</h1>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={generateDocument}>
            Download Report
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MSWordPreview;
