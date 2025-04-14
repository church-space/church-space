import React from "react";

const CCPATable = () => {
  const data = [
    {
      category:
        "Contact information (such as your full name, phone number, email address)",
      purposes:
        "Provide the Services; Communicate with you; Analyze use of and improve the services; With your consent; Comply with law or defend our legal rights; Security/fraud prevention",
      disclosures:
        "Affiliated entities; Service providers; Entities for legal purposes",
      sharing: "We do not share/sell",
    },
    {
      category:
        "Customer service interaction information (including optional surveys and when you ask for help)",
      purposes:
        "Provide the Services; Communicate with you; Analyze use of and improve the services; With your consent; Comply with law or defend our legal rights; Security/fraud prevention",
      disclosures:
        "Affiliated entities; Service providers; Entities for legal purposes",
      sharing: "We do not share/sell",
    },
    {
      category: "Product interaction information",
      purposes:
        "Provide the Services; Communicate with you; Analyze use of and improve the services; With your consent; Comply with law or defend our legal rights; Security/fraud prevention",
      disclosures:
        "Affiliated entities; Service providers; Entities for legal purposes",
      sharing: "We do not share/sell",
    },
    {
      category:
        "Internet network and device information (such as mobile device information, IP address, and information about your interaction with the services)",
      purposes:
        "Provide the Services; Communicate with you; Analyze use of and improve the services; With your consent; Comply with law or defend our legal rights; Security/fraud prevention",
      disclosures:
        "Affiliated entities; Service providers; Entities for legal purposes",
      sharing: "We do not share/sell",
    },
    {
      category: "Login information (such as your username and password)",
      purposes:
        "Provide the Services; Comply with law or defend our legal rights; Security/fraud prevention; Comply with law or defend our legal rights",
      disclosures:
        "Affiliated entities; Service providers; Entities for legal purposes",
      sharing: "We do not share/sell",
    },
    {
      category:
        "Professional or employment information (such as the name and address of the company you work for and your title)",
      purposes:
        "Provide the Services; Communicate with you; Analyze use of and improve the services; With your consent; Comply with law or defend our legal rights; Security/fraud prevention",
      disclosures:
        "Affiliated entities; Service providers; Entities for legal purposes",
      sharing: "We do not share/sell",
    },
    {
      category:
        "Other information (any other information you choose to provide directly to us, including optional profile photos)",
      purposes:
        "Provide the Services; Communicate with you; Analyze use of and improve the services; With your consent; Comply with law or defend our legal rights; Security/fraud prevention",
      disclosures:
        "Affiliated entities; Service providers; Entities for legal purposes",
      sharing: "We do not share/sell",
    },
  ];

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="bg-muted p-4 text-left font-bold">
              Category of personal information
            </th>
            <th className="bg-muted p-4 text-left font-bold">
              Purposes of use
            </th>
            <th className="bg-muted p-4 text-left font-bold">
              Categories of Third Parties to Which We Discloses this Personal
              Information
            </th>
            <th className="bg-muted p-4 text-left font-bold">
              Categories of Third Parties to Which We "Share" and "Sell" this
              Personal Information for Advertising/ Analytics Purposes
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-b even:bg-muted/50">
              <td className="p-4 align-top">{row.category}</td>
              <td className="p-4 align-top">
                <ul className="m-0 list-none p-0">
                  <li className="mb-1">{row.purposes}</li>
                </ul>
              </td>
              <td className="p-4 align-top">
                <ul className="m-0 list-none p-0">
                  <li className="mb-1">{row.disclosures}</li>
                </ul>
              </td>
              <td className="p-4 align-top">{row.sharing}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CCPATable;
