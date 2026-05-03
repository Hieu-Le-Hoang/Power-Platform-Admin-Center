import { GoogleGenAI } from "@google/genai";
import type { Workflow, Dataflow, Solution } from '../types';

/**
 * Generates a human-readable summary of a Power Automate flow using the Gemini API.
 * @param workflow The workflow object to summarize.
 * @returns A promise that resolves to a markdown-formatted summary string.
 */
export const summarizeWorkflow = async (workflow: Workflow): Promise<string> => {
    // The Gemini API key is expected to be available in the execution environment as per setup instructions.
    if (!process.env.API_KEY) {
        throw new Error("The API_KEY environment variable is not configured. This feature is disabled.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const owner = workflow['_ownerid_value@OData.Community.Display.V1.FormattedValue'] || 'N/A';
    
    const prompt = `
You are a helpful assistant for a Power Platform administrator. Your task is to summarize a Power Automate flow's details in a clear, non-technical way.

Here is the flow information:
Name: ${workflow.name}
Description: ${workflow.description || 'No description provided.'}
Owner: ${owner}
Type: ${workflow.categoryText || 'Unknown'}
Status: ${workflow.statusText || 'Unknown'}
Last Modified: ${new Date(workflow.modifiedon).toLocaleString()}

Based on this information, provide the following sections:

**Summary:**
A brief, one-sentence overview of what this flow likely does, based on its name, description, and type.

**Health Analysis:**
An analysis of its current status. Is it active or turned off?

**Suggested Actions:**
Based on the analysis, suggest what the user might need to do (e.g., "No action needed, flow is active," "This flow is currently off. Consider turning it on if it's needed," or "Review this flow to ensure it's still required.").

Use only bolding for the section titles. Do not use any other markdown.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate summary: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the summary.");
    }
};

/**
 * Generates a human-readable summary of a Dataflow using the Gemini API.
 * @param dataflow The dataflow object to summarize.
 * @returns A promise that resolves to a markdown-formatted summary string.
 */
export const summarizeDataflow = async (dataflow: Dataflow): Promise<string> => {
    // The Gemini API key is expected to be available in the execution environment as per setup instructions.
    if (!process.env.API_KEY) {
        throw new Error("The API_KEY environment variable is not configured. This feature is disabled.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const owner = dataflow['_ownerid_value@OData.Community.Display.V1.FormattedValue'] || 'N/A';
    
    const prompt = `
You are a helpful assistant for a Power Platform administrator. Your task is to summarize a Power Platform Dataflow's details in a clear, non-technical way.

Here is the dataflow information:
Name: ${dataflow.msdyn_name}
Description: ${dataflow.msdyn_description || 'No description provided.'}
Owner: ${owner}
Status: ${dataflow.statusText || 'Unknown'}
Last Modified: ${new Date(dataflow.modifiedon).toLocaleString()}

Based on this information, provide the following sections:

**Summary:**
A brief, one-sentence overview of what this dataflow likely does, based on its name and description. It probably moves data from one place to another.

**Health Analysis:**
An analysis of its current status. Is it active or inactive? An inactive dataflow will not run on its schedule.

**Suggested Actions:**
Based on the analysis, suggest what the user might need to do (e.g., "No action needed, dataflow is active and can run on schedule," "This dataflow is currently inactive. Consider activating it if it's needed for data refreshes," or "Review this dataflow to ensure it's still required.").

Use only bolding for the section titles. Do not use any other markdown.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate summary: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the summary.");
    }
};

/**
 * Generates a human-readable summary of a Power Platform Solution using the Gemini API.
 * @param solution The solution object to summarize.
 * @returns A promise that resolves to a markdown-formatted summary string.
 */
export const summarizeSolution = async (solution: Solution): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("The API_KEY environment variable is not configured. This feature is disabled.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const publisher = solution.publisherName || 'N/A';
    
    const prompt = `
You are a helpful assistant for a Power Platform administrator. Your task is to summarize a Power Platform Solution's details in a clear, non-technical way.

Here is the solution information:
Name: ${solution.friendlyname}
Unique Name: ${solution.uniquename}
Description: ${solution.description || 'No description provided.'}
Publisher: ${publisher}
Version: ${solution.version}
Type: ${solution.isManagedText || 'Unknown'}
Last Modified: ${new Date(solution.modifiedon).toLocaleString()}

Based on this information, provide the following sections:

**Summary:**
A brief, one-sentence overview of what this solution is. Explain that a solution is a package for application components.

**Details:**
Mention the publisher, version number, and whether it is Managed or Unmanaged. Briefly explain that 'Managed' solutions are typically used in production environments and are not editable, while 'Unmanaged' solutions are for development environments.

**Suggested Actions:**
Suggest actions based on the type. For an Unmanaged solution, suggest it should only be in a development environment. For a Managed solution, confirm it's suitable for production. If the description is missing, suggest adding one.

Use only bolding for the section titles. Do not use any other markdown.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate summary: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the summary.");
    }
};