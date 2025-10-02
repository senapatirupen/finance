// download.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  
  constructor(private http: HttpClient) { }

  // Method to download file from assets folder
  downloadFile(filename: string): Observable<Blob> {
    const filePath = `assets/files/${filename}`;
    return this.http.get(filePath, { responseType: 'blob' });
  }

  // Alternative method that triggers download automatically
  downloadAndSaveFile(filename: string, downloadName?: string): void {
    const filePath = `assets/files/${filename}`;
    const downloadFileName = downloadName || filename;

    this.http.get(filePath, { responseType: 'blob' }).subscribe(blob => {
      this.triggerDownload(blob, downloadFileName);
    });
  }

  // Helper method to trigger file download
  private triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
    link.remove();
  }

}