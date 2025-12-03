import React from 'react';
import { PhoneOutlined, MailOutlined, EnvironmentOutlined, PrinterOutlined } from '@ant-design/icons';
import { useDocumentTitle, useScrollTop } from '@/hooks';

const ContactUs = () => {
  useDocumentTitle('聯絡我們 | Ares');
  useScrollTop();

  return (
    <div className="contact-us">
      <div className="contact-us-wrapper">
        <div className="contact-header">
          <h1>聯絡我們</h1>
          <p className="subtitle">歡迎與我們聯繫，我們將竭誠為您服務</p>
        </div>

        <div className="contact-content">
          {/* 台南總公司 */}
          <div className="contact-info-section">
            <h2>台南總公司</h2>

            <div className="contact-info-grid">
              <div className="contact-info-item">
                <div className="info-icon">
                  <EnvironmentOutlined />
                </div>
                <div className="info-content">
                  <h3>地址</h3>
                  <p>台南市安平區文平路187巷12號之2</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="info-icon">
                  <PhoneOutlined />
                </div>
                <div className="info-content">
                  <h3>電話</h3>
                  <p><a href="tel:06-2959696">06-2959696</a></p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="info-icon">
                  <PrinterOutlined />
                </div>
                <div className="info-content">
                  <h3>傳真</h3>
                  <p>06-2959667</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="info-icon">
                  <MailOutlined />
                </div>
                <div className="info-content">
                  <h3>電子郵件</h3>
                  <p><a href="mailto:ares@ares-cert.com">ares@ares-cert.com</a></p>
                </div>
              </div>
            </div>
          </div>

          {/* 台北業務據點 */}
          <div className="contact-info-section">
            <h2>台北業務據點</h2>

            <div className="contact-info-grid">
              <div className="contact-info-item">
                <div className="info-icon">
                  <EnvironmentOutlined />
                </div>
                <div className="info-content">
                  <h3>地址</h3>
                  <p>台北市中正區忠孝東路二段88號10樓1006室</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="info-icon">
                  <PhoneOutlined />
                </div>
                <div className="info-content">
                  <h3>電話</h3>
                  <p><a href="tel:02-28800088">02-28800088</a></p>
                </div>
              </div>
            </div>
          </div>

          {/* 桃園業務據點 */}
          <div className="contact-info-section">
            <h2>桃園業務據點</h2>

            <div className="contact-info-grid">
              <div className="contact-info-item">
                <div className="info-icon">
                  <EnvironmentOutlined />
                </div>
                <div className="info-content">
                  <h3>地址</h3>
                  <p>桃園市桃園區中山路425巷3號6樓</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="info-icon">
                  <PhoneOutlined />
                </div>
                <div className="info-content">
                  <h3>電話</h3>
                  <p><a href="tel:03-3395600">03-3395600</a></p>
                </div>
              </div>
            </div>
          </div>

          {/* 台中業務據點 */}
          <div className="contact-info-section">
            <h2>台中業務據點</h2>

            <div className="contact-info-grid">
              <div className="contact-info-item">
                <div className="info-icon">
                  <EnvironmentOutlined />
                </div>
                <div className="info-content">
                  <h3>地址</h3>
                  <p>台中市北屯區中平路1151號3樓之1</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="info-icon">
                  <PhoneOutlined />
                </div>
                <div className="info-content">
                  <h3>電話</h3>
                  <p><a href="tel:04-24266256">04-24266256</a></p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-map-section">
            <h2>位置地圖</h2>
            <p className="text-subtle" style={{ marginBottom: '1rem' }}>台南總公司位置</p>
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3673.002093519271!2d120.17738409999998!3d22.986950499999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x346e75d92b362405%3A0x102b13aef06082dd!2z5Lqe55Ge5LuV5ZyL6Zqb6amX6K2J6IKh5Lu95pyJ6ZmQ5YWs5Y-4!5e0!3m2!1szh-TW!2stw!4v1764667259615!5m2!1szh-TW!2stw"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="台南總公司位置"
              ></iframe>
            </div>
          </div>

          <div className="contact-hours-section">
            <h2>營業時間</h2>
            <div className="hours-grid">
              <div className="hours-item">
                <span className="day">週一至週五</span>
                <span className="time">09:00 - 18:00</span>
              </div>
              <div className="hours-item">
                <span className="day">週六、週日</span>
                <span className="time">公休</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
